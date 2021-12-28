import {
    CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor,
} from '@nestjs/common';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

interface ClearAnswerInterceptorParams {
    fields?: string[],
    sourcePath?: string;
}

type AnySource = Record<string, any> | Record<string, any>[];

const fieldsBlacklist = []; // fields that will not be removed
const defaultSourcePath = 'data';

@Injectable()
export class ClearAnswerInterceptor<T = any, R = any> implements NestInterceptor<T, R> {
    private readonly logger = new Logger(ClearAnswerInterceptor.name);
    private fields: string[] = [];
    private sourcePath = defaultSourcePath;

    constructor(params?: string[] | ClearAnswerInterceptorParams) {
        if (params && Array.isArray(params)) {
            this.fields = params;
        } else if (params && typeof params === 'object') {
            const objectParams = params as ClearAnswerInterceptorParams;

            if (objectParams.fields?.length) {
                this.fields = objectParams.fields;
            }

            if (objectParams.sourcePath) {
                this.sourcePath = objectParams.sourcePath;
            }
        }
    }

    private isEmptyObject(object: Record<any, any>): boolean {
        // check if object
        // eslint-disable-next-line guard-for-in,no-unreachable-loop
        for (const i in object) return false;
        return true;
    }

    private isRedundant(value: any): boolean {
        return (
            value === undefined
            || value === null
            || (value && typeof value === 'object' && this.isEmptyObject(value)));
    }

    private clearSource(source: AnySource) {
        if (Array.isArray(source)) {
            return source.reduce<Record<string, any>[]>((acc, nestedSource) => {
                if (this.isRedundant(nestedSource)) {
                    return acc;
                }

                return [...acc, this.clearSource(nestedSource)];
            }, []);
        }

        if (source && typeof source === 'object') {
            return Object.entries(source).reduce((acc, [key, value]) => {
                if (fieldsBlacklist.find((blacklistField) => blacklistField === key)) {
                    return acc;
                }

                if (this.fields.find((field) => field === key) || this.isRedundant(value)) {
                    delete acc[key];
                    return acc;
                }

                return {...acc, [key]: this.clearSource(value)};
            }, source);
        }

        return source;
    }

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<R> | Promise<Observable<R>> {
        return next
            .handle()
            .pipe(
                switchMap(async (response) => {
                    try {
                        if (!response[this.sourcePath]) {
                            return response;
                        }

                        const source = this.clearSource(response[this.sourcePath]);

                        return {
                            ...response,
                            [this.sourcePath]: source,
                        };
                    } catch (err) {
                        this.logger.error(`Error during clear fields: ["${this.fields.join(', ')}"]`);
                        this.logger.error(err);
                    }

                    return response;
                }),
            );
    }
}
