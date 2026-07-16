export type FileFormatType = 'csv' | 'xlsx' | 'xls' | 'json';
export interface FileFormatOptions {
    type: FileFormatType;
    delimiter?: string;
    encoding?: BufferEncoding;
    hasHeader?: boolean;
    skipRows?: number;
}
export declare class FileParserService {
    private readonly logger;
    parseFile(filePath: string, format: FileFormatOptions): Promise<Record<string, any>[]>;
    private parseCsv;
    private parseExcel;
    private parseJson;
    private applySkipRows;
}
