import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

export type FileFormatType = 'csv' | 'xlsx' | 'xls' | 'json';

export interface FileFormatOptions {
  type: FileFormatType;
  delimiter?: string;
  encoding?: BufferEncoding;
  hasHeader?: boolean;
  skipRows?: number;
}

/**
 * Parses raw source files (CSV, Excel, JSON) into a normalized array of
 * plain JS objects, one per row/record, ready for field mapping.
 */
@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  async parseFile(
    filePath: string,
    format: FileFormatOptions,
  ): Promise<Record<string, any>[]> {
    switch (format.type) {
      case 'csv':
        return this.parseCsv(filePath, format);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(filePath, format);
      case 'json':
        return this.parseJson(filePath);
      default:
        throw new BadRequestException(`Unsupported file format: ${format.type}`);
    }
  }

  private async parseCsv(
    filePath: string,
    format: FileFormatOptions,
  ): Promise<Record<string, any>[]> {
    try {
      const rows = await csv({
        delimiter: format.delimiter ?? ',',
        noheader: format.hasHeader === false,
        trim: true,
      })
        .fromFile(filePath);

      return this.applySkipRows(rows, format.skipRows);
    } catch (error) {
      this.logger.error(`Failed to parse CSV file ${filePath}`, error as Error);
      throw new BadRequestException('Unable to parse CSV file');
    }
  }

  private async parseExcel(
    filePath: string,
    format: FileFormatOptions,
  ): Promise<Record<string, any>[]> {
    try {
      const workbook = XLSX.readFile(filePath);
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
        header: format.hasHeader === false ? 1 : undefined,
        defval: null,
        raw: true,
      });
      return this.applySkipRows(rows, format.skipRows);
    } catch (error) {
      this.logger.error(`Failed to parse Excel file ${filePath}`, error as Error);
      throw new BadRequestException('Unable to parse Excel file');
    }
  }

  private async parseJson(filePath: string): Promise<Record<string, any>[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // Support a { records: [...] } / { data: [...] } envelope shape.
      if (Array.isArray(parsed?.records)) return parsed.records;
      if (Array.isArray(parsed?.data)) return parsed.data;
      throw new Error('JSON payload is not an array of records');
    } catch (error) {
      this.logger.error(`Failed to parse JSON file ${filePath}`, error as Error);
      throw new BadRequestException('Unable to parse JSON file');
    }
  }

  private applySkipRows(
    rows: Record<string, any>[],
    skipRows?: number,
  ): Record<string, any>[] {
    if (!skipRows || skipRows <= 0) return rows;
    return rows.slice(skipRows);
  }
}
