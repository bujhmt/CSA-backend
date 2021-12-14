import {
    CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor,
} from '@nestjs/common';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {set, get} from 'object-path';

interface InterceptorParams<T, D> {
    field: string,
    mapTo?: string,
    recursive?: boolean,
    allowNull?: boolean,
    handler: (value: T) => D | Promise<D>
}

@Injectable()
export class FieldTransformInterceptor<T, D> implements NestInterceptor {
    private readonly logger = new Logger(FieldTransformInterceptor.name);
    private rule: InterceptorParams<T, D>;

    constructor(params: InterceptorParams<T, D>) {
        this.rule = params;
    }

    private async transformValue(value: any): Promise<any> {
        return ((value || this.rule?.allowNull) && this.rule?.handler)
            ? this.rule.handler(value)
            : value;
    }

    private async transformSource(
        source: Record<string, any> | Record<string, any>[],
    ): Promise<Record<string, any> | Record<string, any>[]> {
        if (Array.isArray(source)) {
            return Promise.all(source.map(async (nestedSource) => this.transformSource(nestedSource)));
        }

        if (source && typeof source === 'object') {
            return Object.entries(source).reduce(async (acc, [key, value]) => acc.then(async (partialAcc) => {
                if (this.rule.field === key) {
                    const newValue = await this.transformValue(value);

                    if (this.rule?.mapTo) {
                        delete partialAcc[key];

                        return {
                            ...partialAcc,
                            [this.rule.mapTo]: newValue,
                        };
                    }

                    return {
                        ...partialAcc,
                        [key]: newValue,
                    };
                }
                return {...partialAcc, [key]: await this.transformSource(value)};
            }), Promise.resolve(source));
        }

        return source;
    }

    intercept(context: ExecutionContext, next: CallHandler<Record<string, any>>): Observable<Record<string, any>> {
        return next.handle()
            .pipe(
                switchMap(async (answer) => {
                    try {
                        if (!answer.success || !answer.data) {
                            return answer;
                        }

                        const {data} = answer;

                        if (this.rule.recursive) {
                            return {
                                ...answer,
                                data: (await this.transformSource(data)),
                            };
                        }
                        const value = get(data, this.rule.field);
                        const newValue = await this.transformValue(value);

                        if (newValue) {
                            if (this.rule?.mapTo) {
                                delete data[this.rule.field];
                                await set(data, this.rule.mapTo, newValue);
                            } else {
                                await set(data, this.rule.field, newValue);
                            }

                            return {
                                ...answer,
                                data,
                            };
                        }
                    } catch (err) {
                        this.logger.error(`Error while transforming "${this.rule.field}" field: ${err.message}`);
                    }
                    return answer;
                }),
            );
    }
}
