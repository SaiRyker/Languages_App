import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {Language} from "../prog_langs/prog_langs.model";
import {CModule} from "../course_modules/course_modules.model";
import {StudentGroup} from "../student_groups/student_groups.model";
import {GroupCourse} from "../student_groups/group-courses.model";
import {User} from "../users/user.model";

export enum DiffLevel {
    beginner = 'Начальный',
    intermediate = 'Средний',
    advanced = 'Продвинутый'
}

interface CourseCreationAttrs {
    lang_id: number;
    course_name: string;
    creator_id: number;
    description: string;
    diff_level?: string;
}

@Table({tableName: 'courses'})
export class Course extends Model<Course, CourseCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_course: number;

    @Column({type: DataType.STRING, allowNull:false})
    course_name: string;

    @Column({type: DataType.ENUM(...Object.values(DiffLevel)), allowNull:false, defaultValue: DiffLevel.intermediate})
    diff_level: DiffLevel;

    @ForeignKey(() => Language)
    @Column({type: DataType.INTEGER, allowNull:false})
    lang_id: number;

    @BelongsTo(() => Language)
    language: Language;

    @Column({type: DataType.STRING, allowNull:true})
    description: string;

    @ForeignKey(() => User) // Добавляем внешний ключ для связи с User
    @Column({ type: DataType.INTEGER, allowNull: false })
    creator_id: number;

    @BelongsTo(() => User) // Связь с моделью User
    creator: User;

    @HasMany(() => CModule)
    modules: CModule[]

    @BelongsToMany(() => StudentGroup, () => GroupCourse)
    groups: StudentGroup[];
}