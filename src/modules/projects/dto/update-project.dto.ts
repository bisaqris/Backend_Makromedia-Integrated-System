import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusProyek } from '@prisma/client';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional() @IsEnum(StatusProyek) status?: StatusProyek;
  // General Brief (HTML; dapat memuat gambar sebagai data URL base64).
  @IsOptional() @IsString() brief?: string;
}
