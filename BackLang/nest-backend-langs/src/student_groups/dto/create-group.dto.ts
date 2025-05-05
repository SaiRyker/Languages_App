import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';


export class CreateGroupDto {
    @IsString()
    group_name: string;

    @IsNumber()
    curator_id: number;
}