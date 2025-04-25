import { environment } from "../environments/environment";

export namespace Utils {
    export const base = environment.apiUrlBase

    export const urls = {
        login: Utils.base + 'login',
        user: Utils.base + 'user',
        userVerify: Utils.base + 'user/verify',
        wishlist: Utils.base + 'wishlist',
        product: Utils.base + 'product',
        steam: Utils.base + 'steam',
        amazon: Utils.base + 'amazon',
        contact: Utils.base + 'contact',
    }

}