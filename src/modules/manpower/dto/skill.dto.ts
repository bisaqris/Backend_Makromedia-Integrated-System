import { ArrayUnique, IsArray, IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSkillDto {
  @IsString() name: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateSkillDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class SetManpowerSkillsDto {
  @IsArray() @ArrayUnique() @IsUUID('4', { each: true }) skillIds: string[];
}
