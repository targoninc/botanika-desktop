import {SearchType} from "./SearchType";

export interface SpotifySearchOptions {
    query: string;
    searchTypes: SearchType[];
}