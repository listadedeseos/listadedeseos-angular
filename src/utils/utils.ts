import { environment } from "../environments/environment";
import { Injectable, Injector } from '@angular/core';
import { ToastService } from 'ngx-toastr-notifier';

export namespace Utils {
    export const base = environment.apiUrlBase

    export const urls = {
        login: Utils.base + 'login',
        loginGoogle: Utils.base + 'login-google',
        loginGoogleCallback: Utils.base + 'login-google/callback',
        user: Utils.base + 'user',
        userVerify: Utils.base + 'user/verify',
        wishlist: Utils.base + 'wishlist',
        wishlistUser: Utils.base + 'wishlist/user',
        product: Utils.base + 'product',
        steam: Utils.base + 'steam',
        amazon: Utils.base + 'amazon',
        contact: Utils.base + 'contact',
    }

    // Service registry for global access
    let globalInjector: Injector | null = null;

    export function setGlobalInjector(injector: Injector): void {
        globalInjector = injector;
    }

    // Toast utilities with proper service access
    export class ToastUtils {
        private static getToastService(): ToastService | null {
            try {
                if (!globalInjector) {
                    console.warn('Global injector not set. Call Utils.setGlobalInjector() in your app initialization.');
                    return null;
                }
                return globalInjector.get(ToastService, null);
            } catch (error) {
                console.warn('ToastService not available:', error);
                return null;
            }
        }

        // Toast de éxito
        static success(title: string, message?: string, options?: ToastOptions): void {
            const toastService = this.getToastService();
            if (!toastService) {
                console.log(`✅ SUCCESS: ${title}${message ? ` - ${message}` : ''}`);
                return;
            }
            
            toastService.show('success', message || title, title, {
                duration: options?.duration || 3000,
                showClose: options?.showClose ?? true,
                horizontalPosition: options?.horizontalPosition || 'right',
                verticalPosition: options?.verticalPosition || 'top',
                ...options
            });
        }

        // Toast de error
        static error(title: string, message?: string, options?: ToastOptions): void {
            const toastService = this.getToastService();
            if (!toastService) {
                console.error(`❌ ERROR: ${title}${message ? ` - ${message}` : ''}`);
                return;
            }
            
            toastService.show('error', message || title, title, {
                duration: options?.duration || 5000,
                showClose: options?.showClose ?? true,
                horizontalPosition: options?.horizontalPosition || 'right',
                verticalPosition: options?.verticalPosition || 'top',
                ...options
            });
        }
    }

    // Interface para opciones de toast
    interface ToastOptions {
        duration?: number;
        showClose?: boolean;
        horizontalPosition?: 'left' | 'center' | 'right';
        verticalPosition?: 'top' | 'bottom';
        customClass?: string;
        enableHtml?: boolean;
        [key: string]: any;
    }
}