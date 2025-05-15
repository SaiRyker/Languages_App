import {BadRequestException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {PrTask} from "./pr_tasks.model";
import {CreatePrDto} from "./dto/create-pr.dto";
import {Lesson, LessonType} from "../lessons/lessons.model";
import {Language} from "../prog_langs/prog_langs.model";
import {CModule} from "../course_modules/course_modules.model";
import path from "node:path";
import fs from "node:fs";
import * as tarStream from "tar-stream";
import Docker from "dockerode";

@Injectable()
export class PrTasksService {
    private docker: Docker;

    constructor(@InjectModel(PrTask) private prTaskRep: typeof PrTask,
                @InjectModel(Lesson) private lessonRep: typeof Lesson,
                @InjectModel(Language) private langRep: typeof Language,
                @InjectModel(CModule) private moduleRep: typeof CModule,) {
        this.docker = new Docker();
    }

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

    async getPrTaskByLessonId(lesson_id: number): Promise<PrTask> {
        const prTask = await this.prTaskRep.findOne({
            where: {lesson_id: lesson_id}
        })

        if (!prTask) {
            throw new NotFoundException(`Lesson with id ${lesson_id} not found`);
        }

        return prTask;
    }

    async runCodeInContainer(code: string, lang_name: string, input: string = '') {

        const projectRoot = path.resolve(__dirname, '../../');
        console.log(projectRoot)


        const tempDir = path.join(projectRoot, 'temp');
        console.log(tempDir)
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, {recursive: true});
        }



        const codeFile = lang_name === 'javascript' ? 'solution.js' : 'solution.py';
        console.log(codeFile)

        const codePath = path.join(tempDir, codeFile);
        console.log('Code path:', codePath, 'Content:', code);
        fs.writeFileSync(codePath, code);
        console.log('File written successfully:', fs.existsSync(codePath));

        let output = '';
        let errorOutput = '';

        try {
            console.log(lang_name)
            const image = lang_name === 'javascript' ? 'node:16-slim' : 'python:3.9-slim';
            const cmd = lang_name === 'javascript' ? ['node', '/app/solution.js'] : ['python', '/app/solution.py'];

            console.log(`Creating container with image: ${image}, cmd: ${cmd}`); // Отладка

            const container = await this.docker.createContainer({
                Image: image,
                Cmd: cmd,
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
                Volumes: {'/app': {}},
                WorkingDir: '/app',
            });

            await container.start();

            const tar = tarStream.pack();
            tar.entry({name: codeFile}, fs.readFileSync(codePath));
            tar.finalize();
            await container.putArchive(tar, {path: '/app'});
            console.log('File uploaded to container');

            const stream = await container.attach({
                stream: true,
                stdin: true,
                stdout: true,
                stderr: true,
                logs: true, // Подтягиваем логи для лучшего захвата
            });


            // Обещание для ожидания завершения потока и накопления данных
            await new Promise<void>((resolve, reject) => {
                stream.on('data', (chunk: Buffer) => {
                    const chunkStr = chunk.toString();
                    console.log('Raw chunk received:', chunkStr);
                    output += chunkStr; // Простое добавление без разделения
                    console.log('Output received 1:', output);
                });

                stream.on('error', (err) => {
                    console.error('Stream error:', err.message);
                    errorOutput += err.message;
                    reject(err);
                });

                stream.on('end', () => {
                    console.log('Stream ended');
                    resolve();
                });
            });

            stream.write(input + '\n');
            stream.end();

            const waitResult = await container.wait();
            console.log('Container exit code:', waitResult.StatusCode);

            if (waitResult.StatusCode !== 0) {
                throw new Error(errorOutput || 'Code execution failed');
            }

            console.log('Final output:', output);
            console.log({output})// Отладка перед возвратом
            return {output};
        } catch (err) {
            console.error('Error in runCodeInContainer:', err.message);
            return {output: '', error: err.message};
        } finally {
            console.log('Deleting file:', codePath);
            if (fs.existsSync(codePath)) {
                fs.unlinkSync(codePath);
            }

        }
        ;
    }

    async updateTask(id_pr_task: number, data: { task_name: string; description: string; test_code: string; language_id: number; lesson_id: number }) {
        const task = await this.prTaskRep.findByPk(id_pr_task);
        if (!task) {
            throw new NotFoundException(`Task with id ${id_pr_task} not found`);
        }
        return task.update({
            lesson_id: data.lesson_id,
            task_name: data.task_name,
            language_id: data.language_id,
            description: data.description,
            test_code: data.test_code
        });
    }

}
