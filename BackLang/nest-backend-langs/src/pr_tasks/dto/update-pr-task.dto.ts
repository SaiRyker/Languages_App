import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePrTaskDto {
    @ApiProperty({ description: 'ID задания', example: 1 })
    @IsInt()
    @IsNotEmpty()
    id_pr_task: number;

    @ApiProperty({ description: 'ID урока', example: 1 })
    @IsNotEmpty()
    lesson_id: number;

    @ApiProperty({ description: 'Название задания', example: 'Решение задачи' })
    @IsString()
    @IsNotEmpty()
    task_name: string;

    @ApiProperty({ description: 'Описание задания', example: 'Напишите функцию' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Тестовый код (Jest)', example: 'test("example", () => { expect(1).toBe(1); });' })
    @IsString()
    @IsNotEmpty()
    test_code: string;

    @ApiProperty({ description: 'ID языка программирования', example: 'javascript' })
    @IsString()
    @IsNotEmpty()
    language_id: number;
}