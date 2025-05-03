import {BelongsToMany, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {User} from "../users/user.model";
import {Role} from "./roles.model";


@Table({tableName: 'user_roles', createdAt: false, updatedAt: false})
export class UserRoles extends Model<UserRoles> {

    @ForeignKey(() => Role)
    @Column({type: DataType.INTEGER, primaryKey: true})
    role_id: number;

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER, primaryKey: true})
    user_id: number;
}