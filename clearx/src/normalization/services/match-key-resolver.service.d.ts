import { FieldMappingRule } from './field-transformer.service';
export declare class MatchKeyResolverService {
    private readonly logger;
    resolve(rawRecord: Record<string, any>, rule?: FieldMappingRule): string;
}
