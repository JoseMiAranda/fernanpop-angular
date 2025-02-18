export abstract class CustomResponse {}

export class SuccessResponse extends CustomResponse {
    constructor(public data: any) {
        super();
    }
}

export class ErrorResponse extends CustomResponse {
    constructor(public error: string) {
        super();
    }
}