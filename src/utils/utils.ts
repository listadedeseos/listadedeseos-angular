export namespace Utils{
    export const base = 'http://localhost:8000/api/';

    export enum urls {
        base = Utils.base,
        login = Utils.base + 'login',
        user = Utils.base + 'user',
    }

}