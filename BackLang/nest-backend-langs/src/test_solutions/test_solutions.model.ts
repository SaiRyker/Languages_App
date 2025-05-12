import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import {Lesson} from "../lessons/lessons.model";
import {json} from "sequelize";
import {TestTask} from "../test_tasks/test_tasks.model";
import {User} from "../users/user.model";

export enum TSolStatus {
    uncompleted = 'Неудачно',
    completed = 'Завершено'
}

interface TSolCreationAttrs {
    test_task_id: number;
    student_id: number;
    answer: any;
    status: TSolStatus;
    score: number;
}

@Table({ tableName: 'test_solutions' })
export class TSolution extends Model<TSolution, TSolCreationAttrs> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    id_t_sol: number;

    @ForeignKey(() => TestTask)
    @Column({type: DataType.INTEGER, allowNull:false})
    test_task_id: number;

    @BelongsTo(() => TestTask)
    test_task: TestTask;

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER, allowNull:false})
    student_id: number;

    @BelongsTo(() => User)
    user: User;

    @Column({type: DataType.JSONB, allowNull:false})
    answer: any;

    @Column({type: DataType.ENUM(...Object.values(TSolStatus)), allowNull:false, defaultValue: TSolStatus.uncompleted})
    status: TSolStatus;

    @Column({type: DataType.INTEGER, allowNull:false})
    score: number;

}