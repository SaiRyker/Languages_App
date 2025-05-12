import {Injectable, NotFoundException} from '@nestjs/common';
import {TSolStatus, TSolution} from "./test_solutions.model";
import {InjectModel} from "@nestjs/sequelize";
import {User} from "../users/user.model";
import {TestTask} from "../test_tasks/test_tasks.model";
import {TestTasksService} from "../test_tasks/test_tasks.service";

@Injectable()
export class TestSolutionsService {
    constructor(
        @InjectModel(TSolution) private solutionRep: typeof TSolution,
        @InjectModel(User) private userRep: typeof User,
        @InjectModel(TestTask) private testTaskRep: typeof TestTask,
        private testTasksService: TestTasksService,
    ) {}

    async saveUserSolution(testTaskId: number, userId: number, userAnswer: any[]): Promise<TSolution> {
        const testTask = await this.testTaskRep.findByPk(testTaskId);

        if (!testTask) {
            throw new NotFoundException(`Test task with id ${testTaskId} not found`);
        }

        const correctAnswers = testTask.get("correct") || [];
        const isMultipleChoice = Array.isArray(correctAnswers) && correctAnswers.length > 1;
        let score = 0;
        let status = TSolStatus.uncompleted;

        const user = await this.userRep.findByPk(userId);
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }

        if (isMultipleChoice) {
            // Расчёт процента для множественного выбора
            const correctCount = userAnswer.filter((answer) => correctAnswers.includes(answer)).length;
            score = correctAnswers.length > 0 ? (correctCount / correctAnswers.length) * 100 : 0;
            status = score === 100 ? TSolStatus.completed : TSolStatus.uncompleted;
        } else {
            // Одиночный выбор
            const isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswers.sort());
            score = isCorrect ? 100 : 0;
            status = isCorrect ? TSolStatus.completed : TSolStatus.uncompleted;
        }


        const solution = await this.solutionRep.create({
            test_task_id: testTaskId,
            student_id: userId,
            answer: userAnswer,
            status,
            score
        });

        return solution;
    }

    async getUserSolution(testTaskId: number, userId: number): Promise<TSolution | null> {
        const solution = await this.solutionRep.findAll({
            where: { test_task_id: testTaskId, student_id: userId },
            order: [['id_t_sol', 'DESC']]
        });
        return solution[0] || null;
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
