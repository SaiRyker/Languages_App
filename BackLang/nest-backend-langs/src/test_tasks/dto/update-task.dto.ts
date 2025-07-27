import { IsArray, IsInt, IsNotEmpty, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
    @ApiProperty({ description: 'ID тестового задания', example: 1 })
    @IsInt()
    @IsNotEmpty()
    id_t_task: number;

    @ApiProperty({ description: 'ID урока, к которому привязано задание', example: 1 })
    @IsInt()
    @IsNotEmpty()
    lesson_id: number;

    @ApiProperty({ description: 'Название тестового задания', example: 'Тест по основам JavaScript' })
    @IsString()
    @IsNotEmpty()
    task_name: string;

    @ApiProperty({ description: 'Описание или вопрос теста', example: 'Выберите правильные ответы' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Массив вариантов ответа', example: ['Ответ 1', 'Ответ 2', 'Ответ 3'] })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    task_answers: string[];

    @ApiProperty({ description: 'Массив правильных ответов', example: ['Ответ 1'] })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    correct: string[];
}