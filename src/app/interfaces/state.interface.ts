export abstract class State {
    abstract readonly type: string;
    abstract readonly error?: string;
    abstract readonly data?: any;
}

export class LoadingState implements State {
    readonly type = 'loading';
}

export class SuccessState<T> implements State {
    readonly type = 'success';
    readonly data: T;

    constructor(data: T) {
        this.data = data;
    }
}

export class ErrorState implements State {
    readonly type = 'error';
    readonly error: string;

    constructor(error: string) {
        this.error = error;
    }
}
