import {BelongsToMany, Column, DataType, HasMany, Model, Table} from "sequelize-typescript";
import {Role} from "../roles/roles.model";
import {UserRoles} from "../roles/user-roles.model";
import {SuppReqs} from "../supp_reqs/supp_reqs.model";
import {Notification} from "../user_notifications/user_notifications.model";


interface LangCreationAttrs {
    lang_name: string;
    description: string;
}

@Table({tableName: 'languages'})
export class Language extends Model<Language, LangCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_lang: number;

    @Column({type: DataType.STRING, unique: true, allowNull:false})
    lang_name: string;

    @Column({type: DataType.STRING, allowNull:true})
    description: string;

}