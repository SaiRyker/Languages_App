import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {Course} from "../courses/courses.model";
import {CModule} from "../course_modules/course_modules.model";
import {Material} from "../lesson_materials/lesson_materials.model";


interface LessonCreationAttrs {
    module_id: number;
    lesson_name: string;
    order_number: number;
    description?: string;
}

@Table({tableName: 'lessons'})
export class Lesson extends Model<Lesson, LessonCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_lesson: number;

    @ForeignKey(() => CModule)
    @Column({type: DataType.INTEGER, allowNull:false})
    module_id: number;

    @BelongsTo(() => CModule)
    module: CModule

    @Column({type: DataType.STRING, allowNull:false})
    lesson_name: string;

    @Column({type: DataType.INTEGER, allowNull:false})
    order_number: number;

    @Column({type: DataType.STRING, allowNull:false})
    description: string;

    @HasMany(() => Material)
    materials: Material[];
}