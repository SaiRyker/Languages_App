import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {TestTask} from "./test_tasks.model";
import {Lesson, LessonType} from "../lessons/lessons.model";
import {CModule} from "../course_modules/course_modules.model";
import {Course} from "../courses/courses.model";
import {CreateTaskDto} from "./dto/create-task.dto";
import {Type} from "class-transformer";
import {CheckAnswerDto} from "./dto/check-answer.dto";
import {TSolution} from "../test_solutions/test_solutions.model";
import {User} from "../users/user.model";
import {UpdateTaskDto} from "./dto/update-task.dto";

@Injectable()
export class TestTasksService {
    constructor(@InjectModel(TestTask) private testTaskRep: typeof TestTask,
                @InjectModel(Lesson) private lessonRep: typeof Lesson,
                @InjectModel(CModule) private moduleRep: typeof CModule,
                @InjectModel(TSolution) private tsolutionRep: typeof TSolution,
                @InjectModel(User) private userRep: typeof User,) {}

    async createTestTask(dto: CreateTaskDto) {
        const lesson = await this.lessonRep.findByPk(dto.lesson_id, {
            attributes: ['id_lesson', 'lesson_type'],
        })


        if(!lesson) {
            throw new NotFoundException(`Lesson with id ${dto.lesson_id} not found`);
        }

        if (lesson.get('lesson_type') !== LessonType.TEST) {
            console.log(LessonType.TEST, Type())
            throw new BadRequestException(`Нельзя создать тестовое задание для урока не с типом Тест.`)
        }

        const existingTestTask = await this.testTaskRep.findOne({
            where: { lesson_id: dto.lesson_id },
        });

        if (existingTestTask) {
            throw new BadRequestException(
                `Тестовое задание для данного урока с Id ${dto.lesson_id} уже создано.`
            );
        }

        const testTask = await this.testTaskRep.create(dto);
        return testTask;
    }

    async updateTestTask(dto: UpdateTaskDto): Promise<TestTask> {
        const testTask = await this.testTaskRep.findByPk(dto.id_t_task);
        if (!testTask) {
            throw new NotFoundException(`Тестовое задание с id ${dto.id_t_task} не найдено`);
        }
        console.log(testTask)

        const lesson = await this.lessonRep.findByPk(dto.lesson_id, {
            attributes: ['id_lesson', 'lesson_type'],
        });
        if (!lesson) {
            throw new NotFoundException(`Урок с id ${dto.lesson_id} не найден`);
        }

        if (lesson.get('lesson_type') !== LessonType.TEST) {
            throw new BadRequestException(`Нельзя обновить тестовое задание для урока не с типом Тест`);
        }

        // Проверяем, что все correct элементы существуют в task_answers
        const invalidCorrects = dto.correct.filter((answer) => !dto.task_answers.includes(answer));
        console.log(dto.correct)
        console.log(dto.task_answers)
        console.log(invalidCorrects)
        if (invalidCorrects.length > 0) {
            throw new BadRequestException(`Правильные ответы должны быть из списка вариантов ответа`);
        }

        // Обновляем поля
        await testTask.update({
            lesson_id: dto.lesson_id,
            task_name: dto.task_name,
            description: dto.description,
            task_answers: dto.task_answers,
            correct: dto.correct,
        });

        return testTask;
    }

    async deleteTestTask(id: number): Promise<void> {
        const testTask = await this.testTaskRep.findByPk(id);
        if (!testTask) {
            throw new NotFoundException(`Тестовое задание с id ${id} не найдено`);
        }

        await testTask.destroy();
    }

    async getAllCourseTestTasksByCId(course_id: number): Promise<TestTask[]> {
        const modules = await this.moduleRep.findAll({
            where: {course_id: course_id}
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
        const testTasks = await this.testTaskRep.findAll({
            where: { lesson_id: lessonIds },
            include: [{ model: Lesson, include: [CModule] }],
        });

        return testTasks;
    }

    async checkAnswer(dto: CheckAnswerDto): Promise<{ isCorrect: boolean }> {
        const testTask = await this.testTaskRep.findByPk(dto.task_id);
        if (!testTask) {
            throw new NotFoundException(`Тест с таким id ${dto.task_id} не найден`);
        }

        const userAnswer = dto.userAnswer;
        const correctAnswer = testTask.get('correct')

        if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
            throw new BadRequestException('Both userAnswer and correctAnswer must be arrays');
        }

        // Сравниваем массивы: проверяем, что все элементы совпадают
        const isCorrect =
            userAnswer.length === correctAnswer.length &&
            userAnswer.every((answer, index) => answer === correctAnswer[index]);

        return { isCorrect };
    }

    async getTestTaskByLessonId(lesson_id: number): Promise<TestTask> {
        const lesson = await this.lessonRep.findByPk(lesson_id);
        if (!lesson) {
            throw new NotFoundException(`Урок с таким идентификатором ${lesson_id} не найден`);
        }

        const test = await this.testTaskRep.findOne({
            where: { lesson_id: lesson_id },
        });
        if (!test) {
            throw new NotFoundException(`Тестовое задание не найдено`);
        }

        return test;
    }





}
