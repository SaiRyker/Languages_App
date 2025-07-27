import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../users/user.model'
import { Lesson } from '../lessons/lessons.model';

export enum LessonStatus {
    READ = 'Прочитано',
    UNREAD = 'Непрочитано'
}

interface UserLessonStatusCreationAttrs {
    user_id: number;
    lesson_id: number;
    status: LessonStatus;
}

@Table({
    tableName: 'user_lesson_status',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'lesson_id'],
        },
    ],
})
export class UserLessonStatus extends Model<UserLessonStatus, UserLessonStatusCreationAttrs> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id_status: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    user_id: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Lesson)
    @Column({ type: DataType.INTEGER, allowNull: false })
    lesson_id: number;

    @BelongsTo(() => Lesson)
    lesson: Lesson;

    @Column({
        type: DataType.ENUM(...Object.values(LessonStatus)),
        allowNull: false,
        defaultValue: LessonStatus.UNREAD,
    })
    status: LessonStatus;

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    updated_at: Date;
}