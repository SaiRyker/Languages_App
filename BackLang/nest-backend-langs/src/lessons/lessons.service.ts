import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Lesson, LessonType} from "./lessons.model";
import {CModule} from "../course_modules/course_modules.model";
import {CreateLessonDto} from "./dto/create-lesson.dto";
import {Course} from "../courses/courses.model";
import {UpdateLessonDto} from "./dto/update-lesson.dto";
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class LessonsService {
    constructor(@InjectModel(Lesson) private readonly lessonRep: typeof Lesson,
                @InjectModel(CModule) private moduleRep: typeof CModule,
                private sequelize: Sequelize,) {}

    async createLesson(dto: CreateLessonDto): Promise<Lesson> {
        const module = await this.moduleRep.findByPk(dto.module_id);
        if (!module) {
            throw new NotFoundException(`Module with id ${dto.module_id} not found`);
        }

        // Установка типа урока по умолчанию или из DTO (если предоставлен)
        const lessonType = dto.lesson_type || LessonType.THEORY;
        const lesson = await this.lessonRep.create(dto);
        return lesson;
    }

    async updateLesson(lessonId: number, updateLessonDto: UpdateLessonDto) {
        const lesson = await this.lessonRep.findByPk(lessonId, {
            include: [{ model: CModule, as: 'module' }],
        });
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${lessonId} не найден`);
        }

        return lesson.update(updateLessonDto);
    }

    async deleteLesson(lessonId: number) {
        const lesson = await this.lessonRep.findByPk(lessonId, {
            include: [{ model: CModule, as: 'module' }],
        });
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${lessonId} не найден`);
        }

        await lesson.destroy();
        return { message: 'Урок удалён' };
    }

    async updateLessonOrder(moduleId: number, lessonOrder: { id_lesson: number; order_number: number }[]) {
        console.log('updateLessonOrder called with:', { moduleId, lessonOrder });

        const module = await this.moduleRep.findByPk(moduleId);
        if (!module) {
            throw new NotFoundException(`Модуль с ID ${moduleId} не найден`);
        }

        // Валидация: проверяем, что все уроки существуют и принадлежат модулю
        const lessonIds = lessonOrder.map((l) => l.id_lesson);
        const lessons = await this.lessonRep.findAll({
            where: { id_lesson: lessonIds, module_id: moduleId },
        });
        console.log('Found lessons:', lessons.map(l => ({ id_lesson: l.id_lesson, order_number: l.order_number })));

        if (lessons.length !== lessonOrder.length) {
            throw new BadRequestException('Один или несколько уроков не принадлежат модулю или не существуют');
        }

        // Проверяем, что order_number уникальны
        const orderNumbers = lessonOrder.map((l) => l.order_number);
        if (new Set(orderNumbers).size !== orderNumbers.length) {
            throw new BadRequestException('Порядковые номера уроков должны быть уникальными');
        }

        // Выполняем обновление в транзакции
        return await this.sequelize.transaction(async (transaction) => {
            // Шаг 1: Присваиваем временные отрицательные целые order_number
            const baseTempValue = -1000; // Базовое значение для временных номеров
            for (let i = 0; i < lessonOrder.length; i++) {
                const { id_lesson } = lessonOrder[i];
                const tempOrderNumber = baseTempValue - i; // Уникальные значения: -1000, -1001, -1002, ...
                console.log(`Assigning temp order_number ${tempOrderNumber} to id_lesson ${id_lesson}`);
                await this.lessonRep.update(
                    { order_number: tempOrderNumber },
                    { where: { id_lesson }, transaction },
                );
            }

            // Шаг 2: Устанавливаем окончательные order_number
            for (const { id_lesson, order_number } of lessonOrder) {
                console.log(`Assigning final order_number ${order_number} to id_lesson ${id_lesson}`);
                await this.lessonRep.update(
                    { order_number },
                    { where: { id_lesson }, transaction },
                );
            }

            return { message: 'Порядок уроков обновлён' };
        });
    }

    async getLessonsByCourseId(course_id: number): Promise<Lesson[]> {
        const modules = await this.moduleRep.findAll({
            where: {course_id: course_id},
        });

        if (!modules || modules.length === 0) {
            return [];
        }

        const module_ids = modules.map(m => m.get('id_module'));
        const lessons = await this.lessonRep.findAll({
            where: {module_id: module_ids},
            order: [['module_id', 'ASC'], ['order_number', 'ASC']]
        })
        return lessons;
    }

    async getLessonsByModuleId(module_id: number): Promise<Lesson[]> {
        const module = await this.moduleRep.findByPk(module_id);
        if (!module) {
            throw new NotFoundException(`Module with id ${module_id} not found`);
        }

        const lessons = await this.lessonRep.findAll({
            where: {module_id: module_id},
            order: [['order_number', 'ASC']],
        })

        return lessons;
    }

    async getLessonById(lesson_id: number): Promise<Lesson> {
        const lesson = await this.lessonRep.findByPk(lesson_id, {
            include: [{
                model: CModule,
                include: [{model: Course, attributes: ['id_course', 'course_name']}]
            }]
        });
        if (!lesson) {
            throw new NotFoundException(`Lesson( with id ${lesson_id} not found`);
        }

        return lesson;
    }

}
