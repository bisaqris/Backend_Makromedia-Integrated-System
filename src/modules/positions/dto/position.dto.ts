import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePositionDto {
  @IsString() @MinLength(2) @MaxLength(80) name: string;
}

export class UpdatePositionDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80) name?: string;
}
