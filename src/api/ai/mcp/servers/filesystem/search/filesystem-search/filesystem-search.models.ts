export interface FilesystemSearchResult {
    items: FilesystemSearchItem[];
}

export interface FilesystemSearchItem {
    path: string;
    name: string;
    snippet: string;
    type: 'file' | 'directory';
    modifiedTime?: Date;
}