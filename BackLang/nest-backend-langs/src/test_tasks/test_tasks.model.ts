import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import {Course} from "../courses/courses.model";
import {User} from "../users/user.model";
import {GroupStudent} from "./group-students.model";


export enum GroupStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    COMPLETED = 'completed'
}

@Table({ tableName: 'student_groups' })
export class StudentGroup extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    id_group: number;

    @ForeignKey(() => Course)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    course_id: number;

    @BelongsTo(() => Course)
    course: Course;

    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    group_name: string;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    end_date: Date | null;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    curator_id: number;

    @BelongsTo(() => User)
    curator: User;

    @Column({
        type: DataType.ENUM(...Object.values(GroupStatus)),
        defaultValue: GroupStatus.ACTIVE
    })
    status: GroupStatus;

    @HasMany(() => GroupStudent)
    groupStudents: GroupStudent[];
}