import {mType} from "../lesson_materials.model";
import {IsNotEmpty, IsNumber, IsString} from "class-validator";


export class CreateMaterialDto {
    @IsNumber()
    @IsNotEmpty()
    lesson_id: number;

    @IsNotEmpty()
    material_type: mType;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    url?: string;
}