import {BelongsTo, Column, DataType, ForeignKey, HasMany, Index, Model, Table, Unique} from "sequelize-typescript";
import {Course} from "../courses/courses.model";
import {Lesson} from "../lessons/lessons.model";


interface ModuleCreationAttrs {
    course_id: number;
    module_name: string;
    order_number: number;
}

@Table({
    tableName: 'course_modules',
    indexes: [
        {
            unique: true,
            name: 'courseId_orderNum_constraint',
            fields: ['course_id', 'order_number']
        }
    ]
})
export class CModule extends Model<CModule, ModuleCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_module: number;

    @ForeignKey(() => Course)
    @Column({type: DataType.INTEGER, allowNull:false})
    course_id: number;

    @BelongsTo(() => Course)
    course: Course

    @Column({type: DataType.STRING, allowNull:false, unique: true})
    module_name: string;

    @Column({type: DataType.INTEGER, allowNull:false})
    order_number: number;

    @HasMany(() => Lesson)
    lessons: Lesson[];
}