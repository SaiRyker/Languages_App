import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {Role} from "../roles/roles.model";
import {UserRoles} from "../roles/user-roles.model";
import {SuppReqs} from "../supp_reqs/supp_reqs.model";
import {Notification} from "../user_notifications/user_notifications.model";
import {SuppResps} from "../supp_resps/supp_resps.model";
import {Language} from "../prog_langs/prog_langs.model";

export enum DiffLevel {
    beginning = 'Начальный',
    intermediate = 'Средний',
    professional = 'Продвинутый'
}

interface CourseCreationAttrs {
    language_id: number;
    course_name: string;
    description: string;
    diff_level?: string;
}

@Table({tableName: 'courses'})
export class Course extends Model<Course, CourseCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_course: number;

    @Column({type: DataType.STRING, unique: true, allowNull:false})
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
}