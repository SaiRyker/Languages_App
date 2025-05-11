import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {LessonMaterialsService} from "./lesson_materials.service";
import {CreateMaterialDto} from "./dto/create-material.dto";

@Controller('lmaterials')
export class LessonMaterialsController {
    constructor(private lessonMaterialsService: LessonMaterialsService) {}

    @Post()
    async createMaterial(@Body() dto: CreateMaterialDto) {
        return this.lessonMaterialsService.createMaterial(dto);
    }

    @Get('/:lesson_id')
    async getMaterialByLessonId(@Param('lesson_id') lesson_id: number) {
        return this.lessonMaterialsService.getMaterialsByLessonId(lesson_id);
    }

}
