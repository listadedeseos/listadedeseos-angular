import { environment } from "../environments/environment";

export namespace Utils {
    export const base = environment.apiUrlBase

    export const urls = {
        login: Utils.base + 'login',
        user: Utils.base + 'user',
    }

}