import {Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, BelongsToMany} from 'sequelize-typescript';
import {Course} from "../courses/courses.model";
import {User} from "../users/user.model";
import {GroupStudent} from "./group-students.model";
import {GroupCourse} from "./group-courses.model";


export enum GroupStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    COMPLETED = 'completed'
}

interface GroupCreationAttrs {
    group_name: string;
    curator_id: number;
}

@Table({ tableName: 'student_groups' })
export class StudentGroup extends Model<StudentGroup, GroupCreationAttrs> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    id_group: number;

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
        defaultValue: GroupStatus.ACTIVE, allowNull: false
    })
    status: GroupStatus;

    @BelongsToMany(() => User, () => GroupStudent)
    students: User[];

    @BelongsToMany(() => Course, () => GroupCourse)
    courses: Course[];
}