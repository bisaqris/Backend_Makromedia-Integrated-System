import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectLinkDto {
  @IsString() @MaxLength(120) label: string;
  @IsString() url: string;
}

export class UpdateProjectLinkDto {
  @IsOptional() @IsString() @MaxLength(120) label?: string;
  @IsOptional() @IsString() url?: string;
}
