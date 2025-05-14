import {IsArray, IsNotEmpty, IsNumber, IsString, MinLength} from "class-validator";


export class CreatePrDto {

    @IsNumber()
    @IsNotEmpty()
    lesson_id: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    task_name: string;

    @IsNumber()
    @IsNotEmpty()
    language_id: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    description: string;

    @IsArray()
    test_cases: { input: string; expected: string }[];

    @IsNumber()
    @IsNotEmpty()
    time_limit: number;

    @IsNumber()
    @IsNotEmpty()
    memory_limit: number;
}