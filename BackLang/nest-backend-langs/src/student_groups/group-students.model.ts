import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import {User} from "../users/user.model";
import {StudentGroup} from "./student_groups.model";

interface GroupStCreationAttrs {
    group_id: number;
    student_id: number;
}

@Table({ tableName: 'group_student' })
export class GroupStudent extends Model<GroupStudent, GroupStCreationAttrs> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    id_mid: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    student_id: number;

    @BelongsTo(() => User)
    student: User;

    @ForeignKey(() => StudentGroup)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    group_id: number;

    @BelongsTo(() => StudentGroup)
    group: StudentGroup;
}