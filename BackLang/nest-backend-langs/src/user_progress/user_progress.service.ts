import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Progress, ProgressStatus } from './user_progress.model';
import { User } from '../users/user.model';
import { Course } from '../courses/courses.model';
import {TSolStatus, TSolution} from '../test_solutions/test_solutions.model';
import { PrSolution, PrSolStatus } from '../pr_solutions/pr_solutions.model';
import { Lesson } from '../lessons/lessons.model';
import { CModule } from '../course_modules/course_modules.model';
import { Op } from 'sequelize';
import { TestTask } from '../test_tasks/test_tasks.model';
import { PrTask } from '../pr_tasks/pr_tasks.model';

@Injectable()
export class UserProgressService {
    constructor(
        @InjectModel(Progress) private progressRep: typeof Progress,
        @InjectModel(Course) private courseRep: typeof Course,
        @InjectModel(User) private userRep: typeof User,
        @InjectModel(TSolution) private solutionRep: typeof TSolution,
        @InjectModel(PrSolution) private prSolutionRep: typeof PrSolution,
        @InjectModel(Lesson) private lessonRep: typeof Lesson,
        @InjectModel(CModule) private moduleRep: typeof CModule,
    ) {}

    async createProgressForStudent(studentId: number, courseId: number): Promise<Progress> {
        const existingProgress = await this.progressRep.findOne({
            where: { student_id: studentId, course_id: courseId },
        });
        if (existingProgress) {
            return existingProgress;
        }
        return this.progressRep.create({
            student_id: studentId,
            course_id: courseId,
            status: ProgressStatus.uncompleted,
            completion_percent: 0,
        });
    }

    async createProgressForStudents(studentIds: number[], courseId: number): Promise<Progress[]> {
        const progressRecords = studentIds.map((studentId) =>
            this.createProgressForStudent(studentId, courseId),
        );
        return Promise.all(progressRecords);
    }

    async updateProgress(studentId: number, courseId: number): Promise<Progress> {
        // Поиск записи прогресса
        const progress = await this.progressRep.findOne({
            where: { student_id: studentId, course_id: courseId },
        });
        if (!progress) {
            throw new NotFoundException(`Прогресс для студента ${studentId} и курса ${courseId} не найден`);
        }

        // Проверка существования курса
        const course = await this.courseRep.findByPk(courseId);
        if (!course) {
            throw new NotFoundException(`Курс ${courseId} не найден`);
        }

        // Получение всех модулей курса
        const modules = await this.moduleRep.findAll({
            where: { course_id: courseId },
            attributes: ['id_module'],
        });
        // console.log(modules)
        const moduleIds = modules.map((m) => m.get("id_module"));
        // console.log(moduleIds)
        // console.log(`Module IDs for course ${courseId}:`, moduleIds);

        // Если модулей нет, устанавливаем прогресс 0%
        if (moduleIds.length === 0) {
            console.warn(`No modules found for course ${courseId}`);
            await progress.update({
                completion_percent: 0,
                status: ProgressStatus.uncompleted,
            });
            return progress;
        }

        // Подсчёт всех уроков в модулях
        const totalLessons = await this.lessonRep.count({
            where: { module_id: { [Op.in]: moduleIds } },
        });
        console.log(`Total lessons for course ${courseId}:`, totalLessons);

        // Если уроков нет, устанавливаем прогресс 0%
        if (totalLessons === 0) {
            console.warn(`No lessons found for course ${courseId}`);
            await progress.update({
                completion_percent: 0,
                status: ProgressStatus.uncompleted,
            });
            return progress;
        }

        // Подсчёт завершённых тестовых заданий
        const completedTests = await this.solutionRep.count({
            where: {
                student_id: studentId,
                status: TSolStatus.completed, // Используем TSolStatus
            },
            include: [
                {
                    model: TestTask,
                    required: true,
                    include: [
                        {
                            model: Lesson,
                            where: { module_id: { [Op.in]: moduleIds } },
                            attributes: [],
                            required: true,
                        },
                    ],
                    attributes: [],
                },
            ],
        });
        console.log(`Completed tests for student ${studentId}:`, completedTests);

        // Подсчёт завершённых практических заданий
        const completedPracticals = await this.prSolutionRep.count({
            where: {
                student_id: studentId,
                status: PrSolStatus.completed, // Используем PrSolStatus
            },
            include: [
                {
                    model: PrTask,
                    required: true,
                    include: [
                        {
                            model: Lesson,
                            where: { module_id: { [Op.in]: moduleIds } },
                            attributes: [],
                            required: true,
                        },
                    ],
                    attributes: [],
                },
            ],
        });
        console.log(`Completed practicals for student ${studentId}:`, completedPracticals);

        // Суммарное количество завершённых заданий
        const completedLessons = completedTests + completedPracticals;
        console.log(`Total completed lessons for student ${studentId}:`, completedLessons);

        // Расчёт процента завершения
        const completionPercent = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 0;
        console.log(`Completion percent for student ${studentId}:`, completionPercent);

        // Определение статуса
        let status = ProgressStatus.uncompleted;
        if (completionPercent > 0 && completionPercent < 100) {
            status = ProgressStatus.procession;
        } else if (completionPercent >= 100) {
            status = ProgressStatus.completed;
        }

        // Установка даты завершения
        const completionDate = completionPercent >= 100 ? new Date() : progress.completion_date;

        // Обновление прогресса
        await progress.update({
            completion_percent: Math.min(completionPercent, 100),
            status,
            completion_date: completionDate,
        });

        console.log(`Updated progress for student ${studentId}:`, progress.toJSON());
        return progress;
    }

    async getProgressByCourseAndCreator(creatorId: number, courseId?: number): Promise<Progress[]> {
        const whereCourse = courseId ? { id_course: courseId } : {};
        return this.progressRep.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id_user', 'user_fio', 'user_email'],
                },
                {
                    model: Course,
                    as: 'course',
                    where: { creator_id: creatorId, ...whereCourse },
                    attributes: ['id_course', 'course_name'],
                },
            ],
        });
    }

    async getProgressByStudentAndCourse(studentId: number, courseId: number): Promise<Progress> {
        const progress = await this.progressRep.findOne({
            where: { student_id: studentId, course_id: courseId },
            include: [
                { model: User, as: 'user', attributes: ['id_user', 'user_fio', 'user_email'] },
                { model: Course, as: 'course', attributes: ['id_course', 'course_name'] },
            ],
        });
        if (!progress) {
            throw new NotFoundException(`Прогресс для студента ${studentId} и курса ${courseId} не найден`);
        }
        return progress;
    }
}