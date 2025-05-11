import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class CheckAnswerDto {
    @IsNumber()
    @IsNotEmpty()
    task_id: number;

    @IsArray()
    @IsNotEmpty()
    userAnswer: any[];
}