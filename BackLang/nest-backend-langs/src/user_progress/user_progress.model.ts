import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {User} from "../users/user.model";
import {Course} from "../courses/courses.model";

export enum ProgressStatus {
    uncompleted = 'Не начат',
    completed = 'Завершен',
    procession = 'В процессе'

}

interface ProgressCreationAttrs {
    student_id: number;
    course_id: number;
}

@Table({
    tableName: 'user_progress',
})
export class Progress extends Model<Progress, ProgressCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_progress: number;

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER, allowNull:false})
    student_id: number;

    @BelongsTo(() => User)
    user: User

    @ForeignKey(() => Course)
    @Column({type: DataType.INTEGER, allowNull:false})
    course_id: number;

    @BelongsTo(() => Course)
    course: Course

    @Column({type: DataType.ENUM(...Object.values(ProgressStatus)), allowNull:false, defaultValue: ProgressStatus.uncompleted})
    status: ProgressStatus;

    @Column({type: DataType.DATE, allowNull:true, defaultValue:null})
    completion_date: Date;

    @Column({type: DataType.INTEGER, allowNull:false, defaultValue:0})
    completion_percent: number;
}