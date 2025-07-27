import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TSolution, TSolStatus } from './test_solutions.model';
import { User } from '../users/user.model';
import { TestTask } from '../test_tasks/test_tasks.model';
import { TestTasksService } from '../test_tasks/test_tasks.service';
import { UserProgressService } from '../user_progress/user_progress.service';
import { Lesson } from '../lessons/lessons.model';
import { CModule } from '../course_modules/course_modules.model';

@Injectable()
export class TestSolutionsService {
    constructor(
        @InjectModel(TSolution) private solutionRep: typeof TSolution,
        @InjectModel(User) private userRep: typeof User,
        @InjectModel(TestTask) private testTaskRep: typeof TestTask,
        @InjectModel(Lesson) private lessonRep: typeof Lesson,
        private testTasksService: TestTasksService,
        private userProgressService: UserProgressService,
    ) {}

    async saveUserSolution(testTaskId: number, userId: number, userAnswer: any[]): Promise<TSolution> {
        const testTask = await this.testTaskRep.findByPk(testTaskId, {
            include: [
                {
                    model: Lesson,
                    include: [{ model: CModule, attributes: ['course_id'] }],
                },
            ],
        });

        if (!testTask) {
            throw new NotFoundException(`Test task with id ${testTaskId} not found`);
        }

        const user = await this.userRep.findByPk(userId);
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }

        const correctAnswers = testTask.get('correct') || [];
        const isMultipleChoice = Array.isArray(correctAnswers) && correctAnswers.length > 1;
        let score = 0;
        let status = TSolStatus.uncompleted;

        if (isMultipleChoice) {
            const correctCount = userAnswer.filter((answer) => correctAnswers.includes(answer)).length;
            score = correctAnswers.length > 0 ? (correctCount / correctAnswers.length) * 100 : 0;
            status = score === 100 ? TSolStatus.completed : TSolStatus.uncompleted;
        } else {
            const isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswers.sort());
            score = isCorrect ? 100 : 0;
            status = isCorrect ? TSolStatus.completed : TSolStatus.uncompleted;
        }

        // Поиск существующего решения
        let solution = await this.solutionRep.findOne({
            where: { test_task_id: testTaskId, student_id: userId },
        });
        console.log(solution)

        if (solution) {
            // Обновление существующего решения, если новая попытка лучше
            if (score > solution.get("score") || (score === solution.get("score") && status === TSolStatus.completed)) {
                await solution.update({
                    answer: userAnswer,
                    status,
                    score,
                });
            }
        } else {
            // Создание нового решения
            solution = await this.solutionRep.create({
                test_task_id: testTaskId,
                student_id: userId,
                answer: userAnswer,
                status,
                score,
            });
        }

        // Обновление прогресса, если тест успешно завершён
        if (status === TSolStatus.completed) {
            const courseId = testTask.get("lesson").get("module").get("course_id");
            await this.userProgressService.updateProgress(userId, courseId);
        }

        return solution;
    }

    async getUserSolution(testTaskId: number, userId: number): Promise<TSolution | null> {
        const solution = await this.solutionRep.findOne({
            where: { test_task_id: testTaskId, student_id: userId },
            include: [{ model: TestTask }],
        });
        return solution || null;
    }

    async getUserSolutionsByUserId(userId: number): Promise<TSolution[]> {
        const user = await this.userRep.findByPk(userId);
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }

        const solutions = await this.solutionRep.findAll({
            where: { student_id: userId },
            include: [{ model: TestTask }],
        });
        return solutions;
    }
}