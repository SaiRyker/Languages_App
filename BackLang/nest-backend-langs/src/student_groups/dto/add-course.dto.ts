import {IsArray, IsInt, IsNotEmpty} from "class-validator";

export class addCourseDto {
    @IsInt()
    @IsNotEmpty()
    group_id: number;

    @IsArray()
    @IsInt({ each: true })
    @IsNotEmpty()
    course_ids: number;
}