import {toast} from "./ui";
import {ToastType} from "../enums/ToastType";

export class ApiBase {
    static baseUrl = "http://localhost:48678";

    static async stream(url: string, data = {}, sendCredentials = false) {
        const res = await fetch(ApiBase.baseUrl + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: sendCredentials ? 'include' : 'omit'
        });
        if (!res.ok) {
            throw new Error(res.statusText + " (" + res.body + ")");
        }
        return res.body;
    }

    static async post(url: string, data = {}, sendCredentials = false) {
        const res = await fetch(ApiBase.baseUrl + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: sendCredentials ? 'include' : 'omit'
        });
        return await this.basicResponseHandling(res);
    }

    static async get<T>(url: string, sendCredentials = false) {
        const res = await fetch(ApiBase.baseUrl + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: sendCredentials ? 'include' : 'omit'
        });
        return await this.basicResponseHandling<T>(res);
    }

    static async delete(url: string, sendCredentials = false) {
        const res = await fetch(ApiBase.baseUrl + url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: sendCredentials ? 'include' : 'omit'
        });
        return await this.basicResponseHandling(res);
    }

    static async put(url: string, data = {}, sendCredentials = false) {
        const res = await fetch(ApiBase.baseUrl + url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: sendCredentials ? 'include' : 'omit'
        });
        return await this.basicResponseHandling(res);
    }

    static async basicResponseHandling<T>(res: Response): Promise<ApiResponse<T | string>> {
        const text = await res.text();
        try {
            return {
                status: res.status,
                success: res.ok,
                data: JSON.parse(text) as T
            };
        } catch (e) {
            if (!res.ok) {
                toast(text, null, ToastType.negative);
            }
            return {
                status: res.status,
                success: res.ok,
                data: text
            };
        }
    }
}

export interface ApiResponse<T> {
    status: number;
    success: boolean;
    data: T;
}