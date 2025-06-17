import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {LessonType} from "../lessons.model";

export class UpdateLessonDto {
    @ApiProperty({ example: 'Новый урок', description: 'Название урока' })
    @IsString()
    @IsOptional()
    lesson_name?: string;

    @ApiProperty({ example: 'Описание урока', description: 'Описание урока' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ enum: LessonType, description: 'Тип урока' })
    @IsEnum(LessonType)
    @IsOptional()
    lesson_type?: LessonType;
}