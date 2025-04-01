import { ApiBase } from "./api.base";
import {Asset} from "../../models/Asset";
import {Tag} from "../../models/Tag";
import {AssetSet} from "../../models/AssetSet";
import {Job} from "../../models/Job";
import {Configuration} from "../../models/Configuration";

export class Api extends ApiBase {
    static getAssets() {
        return this.get<Asset[]>('/assets');
    }

    static createAsset(assetData: Partial<Asset>) {
        return this.post('/assets', assetData);
    }

    static getAssetByIdOrUniqueString(identifier: string) {
        return this.get(`/assets/${identifier}`);
    }

    static deleteAssetByIdOrUniqueString(identifier: string) {
        return this.delete(`/assets/${identifier}`);
    }

    static updateAsset(identifier: string, data: Partial<Asset>) {
        return this.put(`/assets/${identifier}`, data);
    }

    static getTags(queryParams?: Record<string, string>) {
        const query = new URLSearchParams(queryParams).toString();
        return this.get(`/tags?${query}`);
    }

    static createTag(tagData: Partial<Tag>) {
        return this.post('/tags', tagData);
    }

    static deleteTagById(id: string) {
        return this.delete(`/tags/${id}`);
    }

    static getSets() {
        return this.get('/sets');
    }

    static createSet(setData: Partial<AssetSet>) {
        return this.post('/sets', setData);
    }

    static deleteSetById(id: string) {
        return this.delete(`/sets/${id}`);
    }

    static getSetById(id: string) {
        return this.get(`/sets/${id}`);
    }

    static createJob(data: Partial<Job>) {
        return this.post('/jobs', data);
    }

    static getJobs() {
        return this.get<Job[]>('/jobs');
    }

    static updateSet(id: string, data: Partial<AssetSet>) {
        return this.put(`/sets/${id}`, data);
    }

    static updateJob(id: string, data: Partial<Job>) {
        return this.put(`/jobs/${id}`, data);
    }

    static deleteJobById(id: string) {
        return this.delete(`/jobs/${id}`);
    }

    static getConfig() {
        return this.get<Configuration>("/config");
    }

    static getConfigKey<T>(key: string) {
        return this.get<T>(`/config/${key}`);
    }

    static setConfigKey(key: string, value: any) {
        return this.put(`/config/${key}`, { value });
    }
}