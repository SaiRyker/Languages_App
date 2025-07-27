import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrSolStatus, PrSolution } from "./pr_solutions.model";
import { InjectModel } from "@nestjs/sequelize";
import { PrTasksService } from "../pr_tasks/pr_tasks.service";
import { ProgLangsService } from "../prog_langs/prog_langs.service";
import { PrTask } from "../pr_tasks/pr_tasks.model";
import { Language } from "../prog_langs/prog_langs.model";
import * as path from "node:path";
import * as fs from "node:fs";
import * as tarStream from 'tar-stream';
import Docker from 'dockerode';
import { Lesson } from "../lessons/lessons.model";
import { CModule } from "../course_modules/course_modules.model";
import { UserProgressService } from "../user_progress/user_progress.service";
import { execSync } from 'child_process';

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
                @InjectModel(Lesson) private lessonRep: typeof Lesson,
                @InjectModel(CModule) private moduleRep: typeof CModule,
                private practicalTasksService: PrTasksService,
                private langService: ProgLangsService,
                private userProgressService: UserProgressService) {
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

    async runCodeWithTests(code: string, language: string, testCode: string): Promise<TestResult[]> {
        const projectRoot = path.resolve(__dirname, '../../');
        const tempDir = path.join(projectRoot, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        if (language.toLowerCase() === 'javascript') {
            const exportMatch = code.match(/export\s+default\s+(\w+);$/);
            if (!exportMatch || !exportMatch[1]) {
                throw new Error('No export default function found. Please add "export default func_name;" at the end of your code.');
            }
            const functionName = exportMatch[1];
            const transformedCode = code.replace(/export\s+default\s+(\w+);$/, 'module.exports = {$1};');

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
            const testResults: TestResult[] = new Array(testCount).fill(null).map(() => ({
                passed: false,
                error: undefined,
            }));

            try {
                const jestOutput = execSync(`jest --json --testPathPattern=temp --input-type=module`, {
                    encoding: 'utf-8',
                    cwd: projectRoot
                });
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
        } else if (language.toLowerCase() === 'python') {
            // Проверяем наличие функции solution
            if (!code.includes('def solution')) {
                throw new BadRequestException('Code must define a function named "solution"');
            }

            // Исправляем отступы в коде
            const lines = code.split('\n');
            let fixedCode = '';
            let inFunction = false;
            for (const line of lines) {
                if (line.trim().startsWith('def solution')) {
                    fixedCode += line + '\n';
                    inFunction = true;
                } else if (inFunction && line.trim() && !line.startsWith('    ')) {
                    fixedCode += '    ' + line.trimStart() + '\n';
                } else {
                    fixedCode += line + '\n';
                }
            }
            console.log('Fixed code:', fixedCode);

            const userCodeFile = path.join(tempDir, 'solution.py');
            fs.writeFileSync(userCodeFile, fixedCode);

            const testFile = path.join(tempDir, 'tests.py');
            // Преобразуем testCode из unittest в pytest
            let transformedTestCode = testCode;
            if (testCode.includes('unittest.TestCase')) {
                transformedTestCode = `import solution\n\n${testCode
                    .replace(/import unittest\n/, '')
                    .replace(/class TestSolution\(unittest\.TestCase\):\n/, '')
                    .replace(/self\.assertEqual\(solution\.solution\(([^)]+)\), ([^)]+)\)/g, 'assert solution.solution($1) == $2')
                    .replace(/    def test_(\w+)\(self\):\n/g, 'def test_$1():\n')
                    .replace(/if __name__ == '__main__':\n    unittest\.main\(\)/, '')}`;
            }
            console.log('Transformed test code:', transformedTestCode);
            fs.writeFileSync(testFile, transformedTestCode);

            const testCountMatch = transformedTestCode.match(/def test_/g);
            const testCount = testCountMatch ? testCountMatch.length : 0;
            console.log('Test count:', testCount);
            const testResults: TestResult[] = new Array(testCount).fill(null).map(() => ({
                passed: false,
                error: undefined,
            }));

            let output = '';
            let errorOutput = '';

            try {
                const container = await this.docker.createContainer({
                    Image: 'python-pytest:3.9-slim',
                    Cmd: ['pytest', '/app/tests.py', '-v'],
                    AttachStdin: true,
                    AttachStdout: true,
                    AttachStderr: true,
                    Tty: false,
                    HostConfig: {
                        Memory: 256 * 1024 * 1024,
                        CpuPeriod: 100000,
                        CpuQuota: 75000,
                        NetworkMode: 'none',
                        AutoRemove: true,
                    },
                    Volumes: { '/app': {} },
                    WorkingDir: '/app',
                });

                await container.start();

                const tar = tarStream.pack();
                tar.entry({ name: 'solution.py' }, fs.readFileSync(userCodeFile));
                tar.entry({ name: 'tests.py' }, fs.readFileSync(testFile));
                tar.finalize();
                await container.putArchive(tar, { path: '/app' });

                const stream = await container.attach({
                    stream: true,
                    stdin: true,
                    stdout: true,
                    stderr: true,
                    logs: true,
                });

                await new Promise<void>((resolve, reject) => {
                    let buffer = Buffer.alloc(0);

                    stream.on('data', (chunk: Buffer) => {
                        buffer = Buffer.concat([buffer, chunk]);
                        while (buffer.length >= 8) {
                            const header = buffer.slice(0, 8);
                            const streamType = header[0];
                            const payloadLength = header.readUInt32BE(4);

                            if (buffer.length < 8 + payloadLength) {
                                break;
                            }

                            const payload = buffer.slice(8, 8 + payloadLength).toString('utf8');
                            if (streamType === 1) {
                                output += payload;
                            } else if (streamType === 2) {
                                errorOutput += payload;
                            }

                            buffer = buffer.slice(8 + payloadLength);
                        }
                    });

                    stream.on('error', (err) => {
                        errorOutput += err.message;
                        reject(err);
                    });

                    stream.on('end', () => {
                        resolve();
                    });
                });

                stream.end();

                const waitResult = await container.wait();
                console.log('Container exit code:', waitResult.StatusCode);
                console.log('Test stdout:', output);
                console.log('Test stderr:', errorOutput);

                if (waitResult.StatusCode !== 0 && !output.includes('===') && !output.includes('passed')) {
                    throw new Error(errorOutput || 'Test execution failed');
                }

                // Парсинг вывода pytest
                const fullOutput = output + '\n' + errorOutput;
                const lines = fullOutput.split('\n');
                let currentTestIndex = -1;
                let currentError: string[] = [];
                let ranTests = 0;

                // Подсчёт выполненных тестов
                for (const line of lines) {
                    const summaryMatch = line.match(/(\d+) passed[,]?|(\d+) failed[,]?|(\d+) errors?/g);
                    if (summaryMatch) {
                        let passed = 0, failed = 0, errors = 0;
                        summaryMatch.forEach(match => {
                            if (match.includes('passed')) passed = parseInt(match, 10);
                            if (match.includes('failed')) failed = parseInt(match, 10);
                            if (match.includes('errors')) errors = parseInt(match, 10);
                        });
                        ranTests = passed + failed + errors;
                    }
                }

                if (ranTests !== testCount) {
                    console.warn(`Warning: Expected ${testCount} tests, but ran ${ranTests}`);
                }

                for (const line of lines) {
                    const testMatch = line.match(/^tests\.py::(test_\w+) (PASSED|FAILED|ERROR)\b/);
                    if (testMatch) {
                        currentTestIndex++;
                        if (currentTestIndex >= testResults.length) continue;
                        console.log(`Parsing test ${currentTestIndex}: ${line}`);
                        const status = testMatch[2];
                        testResults[currentTestIndex].passed = status === 'PASSED';
                        if (currentError.length > 0 && currentTestIndex > 0) {
                            testResults[currentTestIndex - 1].error = currentError.join('\n');
                            console.log(`Set error for test ${currentTestIndex - 1}: ${currentError.join('\n')}`);
                            currentError = [];
                        }
                        if (status !== 'PASSED') {
                            currentError.push(`Test ${testMatch[1]} ${status}`);
                        }
                    } else if (currentError.length > 0 && line.trim() && !line.match(/^===/) && !line.match(/^tests\.py::test_/)) {
                        currentError.push(line);
                    }
                }

                // Записываем последнюю ошибку
                if (currentError.length > 0 && currentTestIndex < testResults.length) {
                    testResults[currentTestIndex].error = currentError.join('\n');
                    console.log(`Set final error for test ${currentTestIndex}: ${currentError.join('\n')}`);
                    currentError = [];
                }

                return testResults;
            } catch (err) {
                console.error('Test execution error:', err.message);
                testResults.forEach((result, index) => {
                    result.error = errorOutput || err.message || 'Test execution failed';
                    result.passed = false;
                    console.log(`Set error for test ${index}: ${result.error}`);
                });
                return testResults;
            } finally {
                if (fs.existsSync(userCodeFile)) fs.unlinkSync(userCodeFile);
                if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
            }
        } else {
            throw new BadRequestException(`Unsupported language: ${language}`);
        }
    }

    async saveUserPrSolution(prTaskId: number, studentId: number, code: string, lang_name: string): Promise<PrSolution> {
        const prTask = await this.prTasksRep.findByPk(prTaskId, {
            include: [{
                model: Lesson,
                include: [{ model: CModule, attributes: ['course_id'] }],
            }]
        });
        if (!prTask) {
            throw new NotFoundException(`Practical task with id ${prTaskId} not found`);
        }

        const courseId = prTask.get("lesson").get("module").get("course_id");
        if (!courseId) {
            throw new NotFoundException(`Course ID not found for practical task ${prTaskId}`);
        }

        const testCode = String(prTask.get("test_code"));
        if (!testCode) {
            throw new NotFoundException(`No test code found for task ${prTaskId}`);
        }

        const testResults = await this.runCodeWithTests(code, lang_name, testCode);
        const passedTests = testResults.filter((result) => result.passed).length;
        const score = passedTests === testResults.length && testResults.length > 0 ? 100 : 0;
        const status = score === 100 ? PrSolStatus.completed : PrSolStatus.error;

        let solution = await this.prSolRep.findOne({
            where: { pr_task_id: prTaskId, student_id: studentId },
        });

        if (solution) {
            if (score >= solution.get("score") || status === PrSolStatus.completed) {
                await solution.update({
                    code_user: code,
                    status,
                    score,
                    test_results: testResults
                });
                console.log(`Updated practical solution:`, solution.toJSON());
            } else {
                console.log(`Solution not updated: new score ${score} < existing ${solution.get("score")}`);
            }
        } else {
            solution = await this.prSolRep.create({
                pr_task_id: prTaskId,
                student_id: studentId,
                code_user: code,
                status,
                score,
                test_results: testResults,
            });
            console.log(`Created practical solution:`, solution.toJSON());
        }

        if (status === PrSolStatus.completed) {
            console.log(`Updating progress for student ${studentId}, course ${courseId}`);
            await this.userProgressService.updateProgress(studentId, courseId);
        }

        return solution;
    }
}