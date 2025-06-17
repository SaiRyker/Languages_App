import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ModuleOrderItem {
    @ApiProperty({ example: 1, description: 'ID модуля' })
    @IsNumber()
    id_module: number;

    @ApiProperty({ example: 1, description: 'Порядковый номер модуля' })
    @IsNumber()
    order_number: number;
}

class LessonOrderItem {
    @ApiProperty({ example: 1, description: 'ID урока' })
    @IsNumber()
    id_lesson: number;

    @ApiProperty({ example: 1, description: 'Порядковый номер урока' })
    @IsNumber()
    order_number: number;
}

class LessonOrderByModule {
    @ApiProperty({ example: 1, description: 'ID модуля' })
    @IsNumber()
    module_id: number;

    @ApiProperty({ type: [LessonOrderItem], description: 'Порядок уроков в модуле' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonOrderItem)
    lessonOrder: LessonOrderItem[];
}

class UpdateModuleItem {
    @ApiProperty({ example: 1, description: 'ID модуля' })
    @IsNumber()
    id_module: number;

    @ApiProperty({ example: 'Updated Module', description: 'Название модуля' })
    @IsString()
    module_name: string;
}

class UpdateLessonItem {
    @ApiProperty({ example: 1, description: 'ID урока' })
    @IsNumber()
    id_lesson: number;

    @ApiProperty({ example: 'Updated Lesson', description: 'Название урока' })
    @IsString()
    lesson_name: string;
}

export class BatchUpdateCourseDto {
    @ApiProperty({ type: [ModuleOrderItem], description: 'Порядок модулей', required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ModuleOrderItem)
    @IsOptional()
    moduleOrder?: ModuleOrderItem[];

    @ApiProperty({ type: [Number], description: 'ID удалённых модулей', required: false })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    deletedModules?: number[];

    @ApiProperty({ type: [UpdateModuleItem], description: 'Обновлённые модули', required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateModuleItem)
    @IsOptional()
    updatedModules?: UpdateModuleItem[];

    @ApiProperty({ type: [LessonOrderByModule], description: 'Порядок уроков по модулям', required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonOrderByModule)
    @IsOptional()
    lessonOrders?: LessonOrderByModule[];

    @ApiProperty({ type: [Number], description: 'ID удалённых уроков', required: false })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    deletedLessons?: number[];

    @ApiProperty({ type: [UpdateLessonItem], description: 'Обновлённые уроки', required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateLessonItem)
    @IsOptional()
    updatedLessons?: UpdateLessonItem[];
}