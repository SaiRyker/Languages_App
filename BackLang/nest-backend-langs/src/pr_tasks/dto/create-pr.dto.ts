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

    @IsString()
    test_code: string;
}