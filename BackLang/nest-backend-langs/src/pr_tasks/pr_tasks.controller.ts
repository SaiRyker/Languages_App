import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {PrTasksService} from "./pr_tasks.service";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {PrTask} from "./pr_tasks.model";
import {CreatePrDto} from "./dto/create-pr.dto";
import {UpdatePrTaskDto} from "./dto/update-pr-task.dto";

@Controller('practicals')
export class PrTasksController {
    constructor(private prTasksService: PrTasksService) {}

    @ApiOperation({ summary: 'Создание практического задания' })
    @ApiResponse({ status: 200, type: PrTask })
    @Post()
    async createPrTask(@Body() dto: CreatePrDto): Promise<PrTask> {
        return this.prTasksService.createPrTask(dto);
    }

    @ApiOperation({ summary: 'Обновление практического задания' })
    @ApiResponse({ status: 200, type: PrTask })
    @Put()
    async updatePrTask(@Body() payload: UpdatePrTaskDto): Promise<PrTask> {
        return this.prTasksService.updatePrTask(payload);
    }

    @ApiOperation({ summary: 'Удаление практического задания' })
    @ApiResponse({ status: 200, description: 'Практическое задание успешно удалено' })
    @Delete(':id')
    async deletePrTask(@Param('id') id: number): Promise<void> {
        return this.prTasksService.deletePrTask(id);
    }

    @ApiOperation({ summary: 'Получение всех практических заданий по ID курса' })
    @ApiResponse({ status: 200, type: [PrTask] })
    @Get('course/:course_id')
    async getPrTasksByCourseId(@Param('course_id') course_id: number): Promise<PrTask[]> {
        return this.prTasksService.getCoursePrTasksByCId(course_id);
    }

    @ApiOperation({ summary: 'Получение практического задания по ID урока' })
    @ApiResponse({ status: 200, type: [PrTask] })
    @Get('lesson/:lesson_id')
    async getPrTaskByLessonId(@Param('lesson_id') lesson_id: number): Promise<PrTask> {
        return this.prTasksService.getPrTaskByLessonId(lesson_id);
    }

    @Post('run-code')
    async runCode(@Body() body: { code: string; lang_name: string }) {
        console.log('Received request:', body); // Отладка
        const { code, lang_name } = body;
        const result = await this.prTasksService.runCodeInContainer(code, lang_name);
        console.log('Response:', result); // Отладка
        return result;
    }

}
