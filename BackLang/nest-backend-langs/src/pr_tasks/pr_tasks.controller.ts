import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {PrTasksService} from "./pr_tasks.service";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {PrTask} from "./pr_tasks.model";
import {CreatePrDto} from "./dto/create-pr.dto";

@Controller('practicals')
export class PrTasksController {
    constructor(private prTasksService: PrTasksService) {}

    @ApiOperation({ summary: 'Создание практического задания' })
    @ApiResponse({ status: 200, type: PrTask })
    @Post()
    async createPrTask(@Body() dto: CreatePrDto): Promise<PrTask> {
        return this.prTasksService.createPrTask(dto);
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
    async runCode(@Body() body: { code: string; language: number }) {
        console.log('Received request:', body); // Отладка
        const { code, language } = body;
        const result = await this.prTasksService.runCodeInContainer(code, language);
        console.log('Response:', result); // Отладка
        return result;
    }

}
