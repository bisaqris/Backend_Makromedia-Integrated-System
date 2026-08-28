import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto';

export class QueryManpowerDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  employmentStatus?: string; // FULLTIME/PART_TIME/FREELANCE/INTERNSHIP

  @IsOptional()
  @IsUUID()
  skillId?: string;
}
