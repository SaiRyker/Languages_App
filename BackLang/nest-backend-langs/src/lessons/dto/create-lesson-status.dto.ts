import { IsEnum } from 'class-validator';
import { LessonStatus } from '../user_lesson_status.model';

export class CreateLessonStatusDto {
    user_id: number;

    lesson_id: number;

    @IsEnum(LessonStatus)
    status: LessonStatus;
}