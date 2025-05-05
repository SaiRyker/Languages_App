import {IsArray, IsInt, IsNotEmpty, IsNumber} from 'class-validator';

export class addStudentsDto {
    @IsInt()
    @IsNotEmpty()
    group_id: number;

    @IsArray()
    @IsInt({ each: true })
    @IsNotEmpty()
    student_ids: number[];
}