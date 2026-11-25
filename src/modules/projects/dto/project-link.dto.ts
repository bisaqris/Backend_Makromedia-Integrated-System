import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProjectLinkType } from '@prisma/client';

export class CreateProjectLinkDto {
  @IsString() @MaxLength(120) label: string;
  @IsString() url: string;
  @IsOptional() @IsEnum(ProjectLinkType) type?: ProjectLinkType;
}

export class UpdateProjectLinkDto {
  @IsOptional() @IsString() @MaxLength(120) label?: string;
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsEnum(ProjectLinkType) type?: ProjectLinkType;
}
