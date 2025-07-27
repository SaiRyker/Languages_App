import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { mType } from '../lesson_materials.model';

export class UpdateMaterialDto {
    @IsOptional()
    @IsInt()
    id_material?: number;

    @IsOptional()
    @IsEnum(mType)
    material_type?: mType;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsInt()
    order_number?: number;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    url?: string;

}