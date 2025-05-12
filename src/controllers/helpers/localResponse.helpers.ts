
interface Body {
    id: number;
    message: string;
    warnings?: string;
}

export class LocalResponse {

    statusCode: number;
    body: Body;

    constructor(statusCode: number, body: Body) {
        this.statusCode = statusCode;
        this.body = body;
    }

    isSuccess() {
        return this.statusCode >= 200 && this.statusCode < 300;
    }
}