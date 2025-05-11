import {IsArray, IsNotEmpty, IsNumber, IsString, MinLength} from "class-validator";


export class CreateTaskDto {

    @IsNumber()
    @IsNotEmpty()
    lesson_id: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    task_name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    description: string;

    @IsArray()
    @IsNotEmpty()
    task_answers: any[];

    @IsArray()
    @IsNotEmpty()
    correct: any[];

}