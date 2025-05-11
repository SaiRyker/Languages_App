import {IsNotEmpty, IsNumber, IsString, MinLength} from "class-validator";


export class CreateLessonDto {
    @IsNumber()
    @IsNotEmpty()
    module_id: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    lesson_name: string;

    @IsNumber()
    @IsNotEmpty()
    order_number: number;

    @IsString()
    description?: string;
}