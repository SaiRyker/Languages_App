import {BelongsToMany, Column, DataType, Model, Table} from "sequelize-typescript";
import {User} from "../users/user.model";
import {UserRoles} from "./user-roles.model";

interface RoleCreationAttrs {
    role_name: string;
    description: string;
}

@Table({tableName: 'roles'})
export class Role extends Model<Role, RoleCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_role: number;

    @Column({type: DataType.STRING, unique: true, allowNull:false})
    role_name: string;

    @Column({type: DataType.STRING, allowNull:false})
    description: string;

    @BelongsToMany(() => User, () => UserRoles)
    users: User[];
}