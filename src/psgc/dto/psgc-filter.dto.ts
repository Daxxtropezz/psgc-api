import { IsOptional, IsString } from 'class-validator';

export class PSGCFilterDto {
  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  parentCode?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
