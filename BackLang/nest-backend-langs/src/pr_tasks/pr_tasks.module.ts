import { Module } from '@nestjs/common';
import { PrTasksService } from './pr_tasks.service';
import { PrTasksController } from './pr_tasks.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {TSolution} from "../test_solutions/test_solutions.model";
import {TestTask} from "../test_tasks/test_tasks.model";
import {PrTask} from "./pr_tasks.model";
import {Lesson} from "../lessons/lessons.model";
import {Language} from "../prog_langs/prog_langs.model";
import {PrSolution} from "../pr_solutions/pr_solutions.model";

@Module({
  providers: [PrTasksService],
  controllers: [PrTasksController],
  imports: [
    SequelizeModule.forFeature([PrTask, Lesson, Language, PrSolution]),
  ],
})
export class PrTasksModule {}
