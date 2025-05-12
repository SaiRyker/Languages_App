import {Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany} from 'sequelize-typescript';
import {Lesson} from "../lessons/lessons.model";
import {Language} from "../prog_langs/prog_langs.model";
import {PrSolution} from "../pr_solutions/pr_solutions.model";

interface PrCreationAttrs {
    lesson_id: number;
    task_name: string;
    language_id: number;
    description: string;
    time_limit: number;
    memory_limit: number;
}

@Table({ tableName: 'pr_tasks' })
export class PrTask extends Model<PrTask, PrCreationAttrs> {
    @Column({type: DataType.INTEGER, primaryKey: true, autoIncrement: true})
    id_pr_task: number;

    @ForeignKey(() => Lesson)
    @Column({type: DataType.INTEGER, allowNull:false})
    lesson_id: number;

    @BelongsTo(() => Lesson)
    lesson: Lesson;

    @Column({type: DataType.STRING, allowNull:false})
    task_name: string;

    @ForeignKey(() => Language)
    @Column({type: DataType.INTEGER, allowNull:false})
    language_id: number;

    @BelongsTo(() => Language)
    language: Language;

    @Column({type: DataType.TEXT, allowNull:false})
    description: string;

    @Column({ type: DataType.JSON , allowNull:false})
    test_cases: Array<{ input: string; output: string }>;

    @Column({type: DataType.INTEGER, allowNull:false})
    time_limit: number;

    @Column({type: DataType.INTEGER, allowNull:false})
    memory_limit: number;

    @Column({type: DataType.ARRAY(DataType.STRING(30)), allowNull:true, defaultValue: []})
    task_tags: string;

    @HasMany(() => PrSolution)
    solutions: PrSolution[];

}