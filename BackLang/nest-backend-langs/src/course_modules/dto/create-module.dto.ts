import {IsInt, IsNotEmpty, IsString, MinLength} from "class-validator";


export class CreateModuleDto {
    @IsInt()
    @IsNotEmpty()
    course_id: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    module_name: string;

    @IsInt()
    @IsNotEmpty()
    order_number: number;
}