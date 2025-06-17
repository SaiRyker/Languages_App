import { IsArray, IsInt, Min } from 'class-validator';

export class removeCoursesDto {
    @IsInt()
    @Min(1)
    group_id: number;

    @IsArray()
    @IsInt({ each: true })
    @Min(1, { each: true })
    course_ids: number[];
}