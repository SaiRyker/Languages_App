import { IsEnum } from 'class-validator';
import { LessonStatus } from '../user_lesson_status.model';

export class UpdateLessonStatusDto {
    @IsEnum(LessonStatus)
    status: LessonStatus;
}