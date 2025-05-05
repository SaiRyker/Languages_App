import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import {User} from "../users/user.model";
import {StudentGroup} from "./student_groups.model";
import {Course} from "../courses/courses.model";

interface GroupCCreationAttrs {
    group_id: number;
    course_id: number;
}

@Table({ tableName: 'group_course' })
export class GroupCourse extends Model<GroupCourse, GroupCCreationAttrs> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    id_gr_course: number;

    @ForeignKey(() => StudentGroup)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    group_id: number;

    @BelongsTo(() => StudentGroup)
    group: StudentGroup;

    @ForeignKey(() => Course)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    course_id: number;

    @BelongsTo(() => Course)
    course: Course;
}