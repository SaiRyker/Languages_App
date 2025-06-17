import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class LessonOrderItem {
    @ApiProperty({ example: 1, description: 'ID урока' })
    @IsNumber()
    id_lesson: number;

    @ApiProperty({ example: 1, description: 'Порядковый номер урока' })
    @IsNumber()
    order_number: number;
}

export class UpdateLessonOrderDto {
    @ApiProperty({ type: [LessonOrderItem], description: 'Массив порядка уроков' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonOrderItem)
    lessonOrder: LessonOrderItem[];
}