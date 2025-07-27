import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserLessonStatus, LessonStatus } from './user_lesson_status.model';
import { Lesson, LessonType } from '../lessons/lessons.model';
import { Sequelize } from 'sequelize-typescript';
import { CreateLessonStatusDto } from './dto/create-lesson-status.dto';
import {TSolution} from "../test_solutions/test_solutions.model";
import {PrSolution} from "../pr_solutions/pr_solutions.model";
import {TestTask} from "../test_tasks/test_tasks.model";
import {PrTask} from "../pr_tasks/pr_tasks.model";

@Injectable()
export class UserLessonStatusService {
    private readonly logger = new Logger(UserLessonStatusService.name);

    constructor(
        @InjectModel(UserLessonStatus) private statusRepository: typeof UserLessonStatus,
        @InjectModel(Lesson) private lessonRepository: typeof Lesson,
        @InjectModel(TSolution) private solutionRep: typeof TSolution,
        @InjectModel(PrSolution) private prSolutionRep: typeof PrSolution,
        private sequelize: Sequelize,
    ) {}

    async getStatus(userId: number, lessonId: number) {
        this.logger.log(`Fetching status for user ${userId}, lesson ${lessonId}`);

        try {
            // Проверяем существование урока
            const lesson = await this.lessonRepository.findByPk(lessonId);
            if (!lesson) {
                this.logger.warn(`Lesson with ID ${lessonId} not found`);
                throw new BadRequestException(`Урок с ID ${lessonId} не найден`);
            }

            // Для не-теоретических уроков возвращаем null
            if (lesson.get("lesson_type") !== LessonType.THEORY) {
                this.logger.log(`Lesson ${lessonId} is not theory, returning null status`);
                return null;
            }

            // Проверяем, есть ли запись
            const statusRecord = await this.statusRepository.findOne({
                where: { user_id: userId, lesson_id: lessonId },
            });

            this.logger.log(`Returning status: ${JSON.stringify(statusRecord) || 'null'}`);
            return statusRecord;
        } catch (error) {
            this.logger.error(`Error fetching status: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getStatusesForModule(userId: number, moduleId: number) {
        this.logger.log(`Fetching statuses for user ${userId}, module ${moduleId}`);

        try {
            // Получаем все уроки модуля
            const lessons = await this.lessonRepository.findAll({
                where: { module_id: moduleId },
                attributes: ['id_lesson', 'lesson_type'],
            });

            if (!lessons.length) {
                this.logger.warn(`No lessons found for module ${moduleId}`);
                return [];
            }

            const lessonIds = lessons.map((lesson) => lesson.get("id_lesson"));

            // Получаем статусы теоретических уроков
            const statuses = await this.statusRepository.findAll({
                where: {
                    user_id: userId,
                    lesson_id: lessonIds,
                },
                attributes: ['lesson_id', 'status'],
            });
            console.log(userId, lessonIds);
            console.log("СТАТУСЫ", statuses)

            // Получаем решения тестов с привязкой к lesson_id через test_tasks
            const testSolutions = await this.solutionRep.findAll({
                where: { student_id: userId },
                attributes: ['test_task_id', 'status', 'score'],
                include: [{
                    model: TestTask,
                    attributes: ['id_t_task', 'lesson_id'],
                    where: { lesson_id: lessonIds },
                }],
            });

            // Получаем решения практик с привязкой к lesson_id через pr_tasks
            const prSolutions = await this.prSolutionRep.findAll({
                where: { student_id: userId },
                attributes: ['pr_task_id', 'status', 'score'],
                include: [{
                    model: PrTask,
                    attributes: ['id_pr_task', 'lesson_id'],
                    where: { lesson_id: lessonIds },
                }],
            });

            // Логируем промежуточные результаты для отладки
            this.logger.log(`Test solutions: ${JSON.stringify(testSolutions)}`);
            this.logger.log(`Practical solutions: ${JSON.stringify(prSolutions)}`);

            const result = lessons.map((lesson) => {
                const lessonId = lesson.get("id_lesson");
                const lessonType = lesson.get("lesson_type");

                if (lessonType === LessonType.THEORY) {
                    const res = statuses.find((s) => s.get("lesson_id") === lessonId);
                    //
                    console.log(res)
                    if (res instanceof UserLessonStatus) {
                        const status = res.get("status") || LessonStatus.UNREAD;
                        return {
                            lesson_id: lessonId,
                            lesson_type: lessonType,
                            status: status === LessonStatus.READ ? 'Прочитано' : 'Непрочитано',
                        };
                    }
                // ?.status || LessonStatus.UNREAD;

                } else if (lessonType === LessonType.TEST) {
                    const solution = testSolutions.find((s) => s.get("test_task").get("lesson_id") === lessonId);
                    const status = solution
                        ? solution.get("status") === 'Завершено' || solution.get("score") > 0
                            ? 'Завершено'
                            : 'Не начато'
                        : 'Не начато';
                    return {
                        lesson_id: lessonId,
                        lesson_type: lessonType,
                        status,
                    };
                } else if (lessonType === LessonType.PRACTICAL) {
                    console.log(lessonId)
                    const solution = prSolutions.find((s) => s.get("pr_task").get("lesson_id") === lessonId);
                    console.log(solution)
                    const status = solution
                        ? solution.get("status") === 'Завершено' || solution.get("score") > 0
                            ? 'Завершено'
                            : 'Не начато'
                        : 'Не начато';
                    return {
                        lesson_id: lessonId,
                        lesson_type: lessonType,
                        status,
                    };
                }

                return {
                    lesson_id: lessonId,
                    lesson_type: lessonType,
                    status: 'Не начато',
                };
            });

            this.logger.log(`Returning statuses: ${JSON.stringify(result)}`);
            return result;
        } catch (error) {
            this.logger.error(`Error fetching statuses for module: ${error.message}`, error.stack);
            throw error;
        }
    }

    async createStatus(dto: CreateLessonStatusDto) {
        this.logger.log(`Creating status for user ${dto.user_id}, lesson ${dto.lesson_id}, status: ${dto.status}`);

        try {
            // Проверяем существование урока
            const lesson = await this.lessonRepository.findByPk(dto.lesson_id);
            if (!lesson) {
                this.logger.warn(`Lesson with ID ${dto.lesson_id} not found`);
                throw new BadRequestException(`Урок с ID ${dto.lesson_id} не найден`);
            }

            // Проверяем, что урок теоретический
            if (lesson.get("lesson_type") !== LessonType.THEORY) {
                this.logger.warn(`Lesson ${dto.lesson_id} is not a theory lesson`);
                throw new BadRequestException('Статус можно создавать только для теоретических уроков');
            }

            // Проверяем, нет ли уже записи
            const existingRecord = await this.statusRepository.findOne({
                where: { user_id: dto.user_id, lesson_id: dto.lesson_id },
            });
            if (existingRecord) {
                this.logger.warn(`Status record already exists for user ${dto.user_id}, lesson ${dto.lesson_id}`);
                throw new BadRequestException('Запись о статусе урока уже существует');
            }

            console.log(dto.status)
            // Создаём запись
            const statusRecord = await this.statusRepository.create({
                user_id: dto.user_id,
                lesson_id: dto.lesson_id,
                status: dto.status,
            });

            this.logger.log(`Status created: ${JSON.stringify(statusRecord)}`);
            return statusRecord;
        } catch (error) {
            this.logger.error(`Error creating status: ${error.message}`, error.stack);
            throw error;
        }
    }

    async updateStatus(userId: number, lessonId: number, status: LessonStatus) {
        this.logger.log(`Updating status for user ${userId}, lesson ${lessonId} to ${status}`);

        try {
            const lesson = await this.lessonRepository.findByPk(lessonId);
            if (!lesson) {
                this.logger.error(`Lesson with ID ${lessonId} not found`);
                throw new BadRequestException(`Урок с ID ${lessonId} не найден`);
            }
            if (lesson.get("lesson_type") !== LessonType.THEORY) {
                this.logger.error(`Lesson ${lessonId} is not a theory lesson`);
                throw new BadRequestException('Статус можно устанавливать только для теоретических уроков');
            }

            const [record, created] = await this.statusRepository.upsert({
                user_id: userId,
                lesson_id: lessonId,
                status,
            });

            this.logger.log(`Status updated: ${JSON.stringify(record)}`);
            return record;
        } catch (error) {
            this.logger.error(`Error updating status: ${error.message}`, error.stack);
            throw error;
        }
    }
}