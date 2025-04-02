export interface GoogleSearchResult {
    kind: string;
    url: {
        type: string;
        template: string;
    };
    queries: {
        request: GoogleSearchRequestItem[];
        nextPage: GoogleSearchRequestItem[];
    },
    context: {
        title: string;
    },
    searchInformation: {
        searchTime: number;
        formattedSearchTime: string;
        totalResults: string;
        formattedTotalResults: string;
    },
    items: GoogleSearchItem[];
}

export interface GoogleSearchRequestItem {
    title: string;
    totalResults: string;
    searchTerms: string;
    count: number;
    startIndex: number;
    inputEncoding: string;
    outputEncoding: string;
    safe: string;
    cx: string;
}

export interface GoogleSearchItem {
    kind: string;
    title: string;
    htmlTitle: string;
    link: string;
    displayLink: string;
    snippet: string;
    htmlSnippet: string;
    formattedUrl: string;
    htmlFormattedUrl: string;
    pagemap: {
        cse_thumbnail: GoogleSearchThumbnail[];
        metatags: any[];
        cse_image: GoogleSearchImage[];
    };
}

export interface GoogleSearchThumbnail {
    src: string;
    width: string;
    height: string;
}

export interface GoogleSearchImage {
    src: string;
}