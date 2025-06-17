import { IsArray, IsInt, Min } from 'class-validator';

export class removeStudentsDto {
    @IsInt()
    @Min(1)
    group_id: number;

    @IsArray()
    @IsInt({ each: true })
    @Min(1, { each: true })
    student_ids: number[];
}