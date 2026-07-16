"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FileParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileParserService = void 0;
const common_1 = require("@nestjs/common");
const csv = require("csvtojson");
const XLSX = require("xlsx");
const fs = require("fs");
let FileParserService = FileParserService_1 = class FileParserService {
    constructor() {
        this.logger = new common_1.Logger(FileParserService_1.name);
    }
    async parseFile(filePath, format) {
        switch (format.type) {
            case 'csv':
                return this.parseCsv(filePath, format);
            case 'xlsx':
            case 'xls':
                return this.parseExcel(filePath, format);
            case 'json':
                return this.parseJson(filePath);
            default:
                throw new common_1.BadRequestException(`Unsupported file format: ${format.type}`);
        }
    }
    async parseCsv(filePath, format) {
        try {
            const rows = await csv({
                delimiter: format.delimiter ?? ',',
                noheader: format.hasHeader === false,
                trim: true,
            })
                .fromFile(filePath);
            return this.applySkipRows(rows, format.skipRows);
        }
        catch (error) {
            this.logger.error(`Failed to parse CSV file ${filePath}`, error);
            throw new common_1.BadRequestException('Unable to parse CSV file');
        }
    }
    async parseExcel(filePath, format) {
        try {
            const workbook = XLSX.readFile(filePath);
            const firstSheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, {
                header: format.hasHeader === false ? 1 : undefined,
                defval: null,
                raw: true,
            });
            return this.applySkipRows(rows, format.skipRows);
        }
        catch (error) {
            this.logger.error(`Failed to parse Excel file ${filePath}`, error);
            throw new common_1.BadRequestException('Unable to parse Excel file');
        }
    }
    async parseJson(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                return parsed;
            }
            if (Array.isArray(parsed?.records))
                return parsed.records;
            if (Array.isArray(parsed?.data))
                return parsed.data;
            throw new Error('JSON payload is not an array of records');
        }
        catch (error) {
            this.logger.error(`Failed to parse JSON file ${filePath}`, error);
            throw new common_1.BadRequestException('Unable to parse JSON file');
        }
    }
    applySkipRows(rows, skipRows) {
        if (!skipRows || skipRows <= 0)
            return rows;
        return rows.slice(skipRows);
    }
};
exports.FileParserService = FileParserService;
exports.FileParserService = FileParserService = FileParserService_1 = __decorate([
    (0, common_1.Injectable)()
], FileParserService);
//# sourceMappingURL=file-parser.service.js.map