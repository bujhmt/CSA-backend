export interface Answer<A> {
    data?: A;
    success: boolean;
    total?: number;
    message?: string;
}
