import { ArrayUnique, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSkillDto {
  @IsString() name: string;
}

export class UpdateSkillDto {
  @IsOptional() @IsString() name?: string;
}

export class SetManpowerSkillsDto {
  @IsArray() @ArrayUnique() @IsUUID('4', { each: true }) skillIds: string[];
}
