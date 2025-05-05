import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import {Lesson} from "../lessons/lessons.model";
import {json} from "sequelize";



interface TestCreationAttrs {
    lesson_id: number;
    task_name: string;
    description: string;
    task_answer: any;
    correct: any
}

@Table({ tableName: 'test_tasks' })
export class TestTask extends Model<TestTask, TestCreationAttrs> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    id_t_task: number;

    @ForeignKey(() => Lesson)
    @Column({type: DataType.INTEGER, allowNull:false})
    lesson_id: number;

    @BelongsTo(() => Lesson)
    lesson: Lesson;

    @Column({type: DataType.STRING, allowNull:false})
    task_name: string;

    @Column({type: DataType.STRING, allowNull:false})
    description: string;

    @Column({type: DataType.JSONB, allowNull:false})
    task_answers: any;

    @Column({type: DataType.JSONB, allowNull:false})
    correct: any;

}