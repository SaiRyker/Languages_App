import {IsArray, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';


export class CreateGroupDto {
    @IsString()
    group_name: string;

    @IsOptional()
    @IsNumber()
    curator_id: number;
}