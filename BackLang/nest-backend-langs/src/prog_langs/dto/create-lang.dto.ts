import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateLanguageDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    lang_name: string;

    @IsString()
    @IsOptional()
    description: string;
}