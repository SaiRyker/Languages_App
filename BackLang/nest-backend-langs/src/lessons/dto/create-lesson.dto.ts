import {IsEnum, IsNotEmpty, IsNumber, IsString, MinLength} from "class-validator";
import {LessonType} from "../lessons.model";


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

    @IsEnum(LessonType)
    lesson_type: LessonType;

    @IsString()
    description?: string;
}