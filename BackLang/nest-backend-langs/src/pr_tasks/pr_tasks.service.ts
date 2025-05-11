import {BadRequestException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {PrTask} from "./pr_tasks.model";
import {CreatePrDto} from "./dto/create-pr.dto";
import {Lesson, LessonType} from "../lessons/lessons.model";
import {Language} from "../prog_langs/prog_langs.model";
import {CModule} from "../course_modules/course_modules.model";

@Injectable()
export class PrTasksService {
    constructor(@InjectModel(PrTask) private prTaskRep: typeof PrTask,
                @InjectModel(Lesson) private lessonRep: typeof Lesson,
                @InjectModel(Language) private langRep: typeof Language,
                @InjectModel(CModule) private moduleRep: typeof CModule,) {}

    async createPrTask(dto: CreatePrDto): Promise<PrTask> {
        const lesson = await this.lessonRep.findByPk(dto.lesson_id, {
            attributes: ['id_lesson', 'lesson_type'],
        })

        if(!lesson) {
            throw new NotFoundException(`Lesson with id ${dto.lesson_id} not found`);
        }

        if (lesson.get("lesson_type") !== LessonType.PRACTICAL) {
            throw new BadRequestException(`Урок, к которому вы хотите создать задачу не принадлежит к типу "практика"`);
        }

        const existingPrTask = await this.prTaskRep.findOne({
            where: { lesson_id: dto.lesson_id },
        });
        if (existingPrTask) {
            throw new BadRequestException(
                `Практическая задача для данного урока с Id ${dto.lesson_id} уже создана.`
            );
        }

        const language = await this.langRep.findByPk(dto.language_id);
        if (!language) {
            throw new NotFoundException(`Language with id ${dto.language_id} not found`);
        }

        const prTask = await this.prTaskRep.create(dto);
        return prTask;
    }

    async getCoursePrTasksByCId(course_id: number): Promise<PrTask[]> {
        const modules = await this.moduleRep.findAll({
            where: { course_id: course_id },
        });

        if (!modules || modules.length === 0) {
            return [];
        }

        const moduleIds = modules.map((module) => module.get('id_module'));
        const lessons = await this.lessonRep.findAll({
            where: { module_id: moduleIds },
        });

        if (!lessons || lessons.length === 0) {
            return [];
        }

        const lessonIds = lessons.map((lesson) => lesson.get('id_lesson'));
        const prTasks = await this.prTaskRep.findAll({
            where: { lesson_id: lessonIds },
            include: [
                { model: Lesson, include: [CModule] },
                { model: Language },
            ],
        });

        return prTasks;
    }

}
