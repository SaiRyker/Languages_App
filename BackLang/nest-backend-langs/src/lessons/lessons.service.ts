import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Lesson, LessonType} from "./lessons.model";
import {CModule} from "../course_modules/course_modules.model";
import {CreateLessonDto} from "./dto/create-lesson.dto";
import {Course} from "../courses/courses.model";

@Injectable()
export class LessonsService {
    constructor(@InjectModel(Lesson) private readonly lessonRep: typeof Lesson,
                @InjectModel(CModule) private moduleRep: typeof CModule) {}

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
