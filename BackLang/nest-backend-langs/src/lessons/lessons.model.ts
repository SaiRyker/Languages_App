import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {Course} from "../courses/courses.model";
import {CModule} from "../course_modules/course_modules.model";
import {Material} from "../lesson_materials/lesson_materials.model";
import {TestTask} from "../test_tasks/test_tasks.model";
import {PrTask} from "../pr_tasks/pr_tasks.model";


export enum LessonType {
    THEORY = 'теория',
    TEST = 'тест',
    PRACTICAL = 'практика',
}

interface LessonCreationAttrs {
    module_id: number;
    lesson_name: string;
    order_number: number;
    lesson_type: LessonType;
    description?: string;
}

@Table({
    tableName: 'lessons',
    indexes: [
        {
            unique: true,
            name: 'modulerId_orderNumLesson_constraint',
            fields: ['module_id', 'order_number']
        }
    ]
})
export class Lesson extends Model<Lesson, LessonCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_lesson: number;

    @ForeignKey(() => CModule)
    @Column({type: DataType.INTEGER, allowNull:false})
    module_id: number;

    @BelongsTo(() => CModule)
    module: CModule

    @Column({type: DataType.STRING, allowNull:false, unique: true})
    lesson_name: string;

    @Column({type: DataType.INTEGER, allowNull:false})
    order_number: number;

    @Column({type: DataType.STRING, allowNull:true})
    description: string;

    @Column({
        type: DataType.ENUM(...Object.values(LessonType)),
        allowNull: false,
        defaultValue: LessonType.THEORY,
    })
    lesson_type: LessonType;

    @HasMany(() => Material)
    materials: Material[];

    @HasMany(() => TestTask)
    test_tasks: TestTask[];

    @HasMany(() => PrTask)
    pr_tasks: PrTask[];
}