import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {CModule} from "./course_modules.model";
import {CreateModuleDto} from "./dto/create-module.dto";
import {CreateCourseDto} from "../courses/dto/create-course.dto";
import {Course} from "../courses/courses.model";
import {Role} from "../roles/roles.model";
import {UpdateModuleDto} from "./dto/update-module.dto";
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class CourseModulesService {
    constructor(@InjectModel(CModule) private moduleRep: typeof CModule,
                @InjectModel(Course) private courseRep: typeof Course,
                private sequelize: Sequelize,) {}

    async createModule(dto: CreateModuleDto) {
        const course = await this.courseRep.findByPk(dto.course_id);
        if (!course) {
            throw new NotFoundException(`Course with id ${dto.course_id} not found`);
        }

        const module = await this.moduleRep.create(dto);
        return module;
    }

    async updateModule(moduleId: number, updateModuleDto: UpdateModuleDto) {
        const module = await this.moduleRep.findByPk(moduleId, {
            include: [{ model: Course, as: 'course' }],
        });
        console.log(module)
        if (!module) {
            throw new NotFoundException('Модуль не найден');
        }

        return module.update(updateModuleDto);
    }

    async deleteModule(moduleId: number) {
        const module = await this.moduleRep.findByPk(moduleId, {
            include: [{ model: Course, as: 'course' }],
        });
        if (!module) {
            throw new NotFoundException('Модуль не найден');
        }

        await module.destroy();
        return { message: 'Модуль удалён' };
    }

    async updateModuleOrder(courseId: number, moduleOrder: { id_module: number; order_number: number }[]) {
        console.log('updateModuleOrder called with:', { courseId, moduleOrder });

        const course = await this.courseRep.findByPk(courseId);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        // Валидация: проверяем, что все модули существуют и принадлежат курсу
        const moduleIds = moduleOrder.map((m) => m.id_module);
        const modules = await this.moduleRep.findAll({
            where: { id_module: moduleIds, course_id: courseId },
        });
        console.log('Found modules:', modules.map(m => ({ id_module: m.id_module, order_number: m.order_number })));

        if (modules.length !== moduleOrder.length) {
            throw new BadRequestException('Один или несколько модулей не принадлежат курсу или не существуют');
        }

        // Проверяем, что order_number уникальны
        const orderNumbers = moduleOrder.map((m) => m.order_number);
        if (new Set(orderNumbers).size !== orderNumbers.length) {
            throw new BadRequestException('Порядковые номера должны быть уникальными');
        }

        // Выполняем обновление в транзакции
        return await this.sequelize.transaction(async (transaction) => {
            // Шаг 1: Присваиваем временные отрицательные целые order_number
            const baseTempValue = -1000; // Базовое значение для временных номеров
            for (let i = 0; i < moduleOrder.length; i++) {
                const { id_module } = moduleOrder[i];
                const tempOrderNumber = baseTempValue - i; // Уникальные значения: -1000, -1001, -1002, ...
                console.log(`Assigning temp order_number ${tempOrderNumber} to id_module ${id_module}`);
                await this.moduleRep.update(
                    { order_number: tempOrderNumber },
                    { where: { id_module }, transaction },
                );
            }

            // Шаг 2: Устанавливаем окончательные order_number
            for (const { id_module, order_number } of moduleOrder) {
                console.log(`Assigning final order_number ${order_number} to id_module ${id_module}`);
                await this.moduleRep.update(
                    { order_number },
                    { where: { id_module }, transaction },
                );
            }

            return { message: 'Порядок модулей обновлён' };
        });
    }

    async getModulesByCourseId(course_id: number): Promise<CModule[]> {
        if (course_id === undefined) {
            throw new NotFoundException(`Undefined parameter ${course_id}`);
        }
        const course = await this.courseRep.findByPk(course_id);
        if (!course) {
            throw new NotFoundException(`Course with id ${course_id} not found`);
        }

        const modules = await this.moduleRep.findAll({
            where: { course_id: course_id },
            order: [['order_number', 'ASC']],
        });
        return modules;
    }
}
