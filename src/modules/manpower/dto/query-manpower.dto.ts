import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto';

// Nilai kolom Manpower.employmentStatus (String di schema; divalidasi di layer DTO).
export const EMPLOYMENT_STATUSES = ['FULLTIME', 'PART_TIME', 'FREELANCE', 'INTERNSHIP'] as const;

export class QueryManpowerDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(EMPLOYMENT_STATUSES)
  employmentStatus?: string;

  @IsOptional()
  @IsUUID()
  skillId?: string;
}
