import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePositionDto {
  @IsString() @MinLength(2) @MaxLength(80) name: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdatePositionDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80) name?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
