import {mType} from "../lesson_materials.model";
import {IsInt, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";


export class CreateMaterialDto {
    @IsNumber()
    @IsNotEmpty()
    lesson_id: number;

    @IsNotEmpty()
    material_type: mType;

    @IsString()
    content: string;

    @IsInt()
    @IsNotEmpty()
    order_number: number;

    @IsOptional()
    @IsString()
    title?: string;

    @IsString()
    url?: string;
}