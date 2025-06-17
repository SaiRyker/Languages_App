import { IsInt, IsString, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';
import { DiffLevel } from '../courses.model';

export class CreateCourseDto {
    @IsInt()
    @IsNotEmpty()
    lang_id: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    course_name: string;

    @IsInt()
    @IsNotEmpty()
    creator_id: number;

    @IsString()
    @IsOptional()
    description: string;

    @IsEnum(DiffLevel)
    @IsOptional()
    diff_level: DiffLevel;

}