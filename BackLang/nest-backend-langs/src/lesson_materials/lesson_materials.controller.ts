import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {LessonMaterialsService} from "./lesson_materials.service";
import {CreateMaterialDto} from "./dto/create-material.dto";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {UpdateMaterialDto} from "./dto/update-material.dto";
import {UpdateMaterialOrderDto} from "./dto/update-material-order.dto";

@Controller('lmaterials')
export class LessonMaterialsController {
    constructor(private lessonMaterialsService: LessonMaterialsService) {}

    @Post()
    async createMaterial(@Body() dto: CreateMaterialDto) {
        return this.lessonMaterialsService.createMaterial(dto);
    }

    @ApiOperation({ summary: 'Обновление материала урока' })
    @ApiResponse({ status: 200, description: 'Материал обновлен' })
    @Put(':materialId')
    async updateMaterial(@Param('materialId') materialId: number, @Body() dto: UpdateMaterialDto) {
        return this.lessonMaterialsService.updateMaterial(materialId, dto);
    }

    @ApiOperation({ summary: 'Обновление порядка материалов в уроке' })
    @ApiResponse({ status: 200, description: 'Порядок материалов обновлён' })
    @Put('lesson/:lessonId/order')
    async updateMaterialOrder(@Param('lessonId') lessonId: number, @Body() dto: UpdateMaterialOrderDto) {
        return this.lessonMaterialsService.updateMaterialOrder(lessonId, dto.materialOrder);
    }

    @ApiOperation({ summary: 'Удаление материала урока' })
    @ApiResponse({ status: 200, description: 'Материал удалён' })
    @Delete(':materialId')
    async deleteMaterial(@Param('materialId') materialId: number) {
        return this.lessonMaterialsService.deleteMaterial(materialId);
    }

    @Get('/:lesson_id')
    async getMaterialByLessonId(@Param('lesson_id') lesson_id: number) {
        return this.lessonMaterialsService.getMaterialsByLessonId(lesson_id);
    }

}
