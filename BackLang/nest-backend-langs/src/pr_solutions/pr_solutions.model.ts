import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import {Lesson} from "../lessons/lessons.model";
import {json} from "sequelize";
import {TestTask} from "../test_tasks/test_tasks.model";
import {User} from "../users/user.model";
import {PrTask} from "../pr_tasks/pr_tasks.model";

export enum PrSolStatus {
    uncompleted = 'Неудачно',
    completed = 'Завершено',
    error = 'Ошибка'
}

interface PrSolCreationAttrs {
    pr_task_id: number;
    student_id: number;
    code_user: string;
    status: PrSolStatus;
    score: number;
    test_results: {passed: boolean; error?: string }[];
}

@Table({ tableName: 'pr_solutions' })
export class PrSolution extends Model<PrSolution, PrSolCreationAttrs> {
    @Column({type: DataType.INTEGER, primaryKey: true, autoIncrement: true})
    id_pr_sol: number;

    @ForeignKey(() => PrTask)
    @Column({type: DataType.INTEGER, allowNull:false})
    pr_task_id: number;

    @BelongsTo(() => PrTask)
    pr_task: PrTask;

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER, allowNull:false})
    student_id: number;

    @BelongsTo(() => User)
    user: User;

    @Column({type: DataType.TEXT})
    code_user: string;

    @Column({type: DataType.ENUM(...Object.values(PrSolStatus)), allowNull:false, defaultValue: PrSolStatus.uncompleted})
    status: PrSolStatus;

    @Column({type: DataType.INTEGER, allowNull:false})
    score: number;

    @Column({ type: DataType.JSON })
    test_results: {
        passed: boolean;
        error?: string;
    }[];
}