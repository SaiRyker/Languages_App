import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {Model} from "sequelize-typescript";
import {PrSolStatus, PrSolution} from "./pr_solutions.model";
import {InjectModel} from "@nestjs/sequelize";
import {PrTasksService} from "../pr_tasks/pr_tasks.service";
import {ProgLangsService} from "../prog_langs/prog_langs.service";
import {PrTask} from "../pr_tasks/pr_tasks.model";
import {Language} from "../prog_langs/prog_langs.model";
import * as path from "node:path";
import * as fs from "node:fs";
import * as tarStream from 'tar-stream';
import Docker from 'dockerode'
import {TSolution} from "../test_solutions/test_solutions.model";
import { execSync } from 'child_process';
import * as test from "node:test";

// Интерфейс для результатов теста
export interface TestResult {
    passed: boolean;
    error?: string;
}

@Injectable()
export class PrSolutionsService {
    private docker: Docker;
    constructor(@InjectModel(PrSolution) private prSolRep: typeof PrSolution,
                @InjectModel(PrTask) private prTasksRep: typeof PrTask,
                @InjectModel(Language) private langRep: typeof Language,
                private practicalTasksService: PrTasksService,
                private langService: ProgLangsService) {
        try {
            this.docker = new Docker();
        } catch (err) {
            throw new Error('Failed to initialize Docker: ' + err.message);
        }
    }

    async getUserPrSolution(prTask_id: number, student_id: number): Promise<PrSolution | null> {
        return this.prSolRep.findOne({
            where: { pr_task_id: prTask_id, student_id: student_id },
            order: [['id_pr_sol', 'DESC']],
        });
    }

    async runCodeWithTests(
        code: string,
        language: string,
        testCode: string,
    ): Promise<TestResult[]> {
        if (language !== 'javascript') {
            throw new Error('Jest-based testing is currently only supported for JavaScript');
        }

        const exportMatch = code.match(/export\s+default\s+(\w+);$/);
        if (!exportMatch || !exportMatch[1]) {
            throw new Error('No export default function found. Please add "export default func_name;" at the end of your code.');
        }
        const functionName = exportMatch[1];
        const transformedCode = code.replace(/export\s+default\s+(\w+);$/, 'module.exports = {$1};');
        const projectRoot = path.resolve(__dirname, '../../');
        const tempDir = path.join(projectRoot, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const userCodeFile = path.join(tempDir, 'solution.js');
        const wrappedCode = `
      ${transformedCode}
      module.exports = { ${functionName} };
    `;
        fs.writeFileSync(userCodeFile, wrappedCode);

        const testFile = path.join(tempDir, 'solution.test.js');
        const testContent = `        
      const { ${functionName} } = require('./solution');
      ${testCode}
    `;
        fs.writeFileSync(testFile, testContent);

        const testCount = (testCode.match(/test\(/g) || []).length;
        const testResults: TestResult[] = new Array(testCount).fill(null).map((_, index) => ({
            passed: false,
            error: undefined,
        }));

        try {
            const jestOutput = execSync(`jest --json --testPathPattern=temp --input-type=module`,
                { encoding: 'utf-8', cwd: projectRoot });
            const jestResult = JSON.parse(jestOutput);

            jestResult.testResults.forEach((testResult: any) => {
                testResult.assertionResults.forEach((assertion: any, index: number) => {
                    testResults[index].passed = assertion.status === 'passed';
                    if (assertion.status === 'failed') {
                        testResults[index].error = assertion.failureMessages?.[0] || 'Test failed';
                    }
                });
            });

            if (jestResult.testResults.some((result: any) => result.message && result.message.includes('Cannot find module'))) {
                throw new Error(`Function "${functionName}" not found`);
            }
            return testResults;
        } catch (err) {
            const errorMessage = err.message || err.toString();
            if (errorMessage.includes('Cannot find module') || errorMessage.includes('is not defined')) {
                throw new Error(`Function "${functionName}" not found`);
            }

            testResults.forEach((result) => {
                result.error = errorMessage;
                result.passed = false;
            });
            return testResults;
        } finally {
            if (fs.existsSync(userCodeFile)) fs.unlinkSync(userCodeFile);
            if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        }
    }


    async saveUserPrSolution(prTaskId: number, studentId: number, code: string, lang_name: string): Promise<PrSolution> {
        const prTask = await this.prTasksRep.findByPk(prTaskId);
        if (!prTask) {
            throw new NotFoundException(`Practical task with id ${prTaskId} not found`);
        }

        const testCode = String(prTask.get("test_code"));

        if (!testCode) {
            throw new NotFoundException(`No test code found for task ${prTaskId}`);
        }

        const testResults = await this.runCodeWithTests(code, lang_name, testCode);
        const score = testResults.filter((result) => result.passed).length ? 100 : 0;
        const status = score === 100 ? PrSolStatus.completed : score > 0 ? PrSolStatus.uncompleted : PrSolStatus.error;

        const prSolution = await this.prSolRep.create({
            pr_task_id: prTaskId,
            student_id: studentId,
            code_user: code,
            status,
            score,
            test_results: testResults,
        });

        return prSolution;
    }
}
