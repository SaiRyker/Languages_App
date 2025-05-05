import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {User} from "../users/user.model";

export enum NotificationStatus {
    UNREAD = 'unread',
    READ = 'read'
}

interface NotificationCreationAttrs {
    user_id: number;
    content: string;
}

@Table({
    tableName: 'user_notifications',
    timestamps: false,
    hooks: {
        beforeCreate: (user_notifications: Notification) => {
            if (!user_notifications.sent_date) {
                user_notifications.sent_date = new Date();
            }

            if(!user_notifications.status){
                user_notifications.status = NotificationStatus.UNREAD;
            }
        }
    }

})
export class Notification extends Model<Notification, NotificationCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_notification: number;

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER, allowNull:false})
    user_id: number;

    @BelongsTo(() => User)
    user: User

    @Column({type: DataType.TEXT, allowNull:false})
    content: string;

    @Column({type: DataType.DATE, allowNull:false, defaultValue:DataType.NOW})
    sent_date: Date;

    @Column({type: DataType.ENUM(NotificationStatus.UNREAD, NotificationStatus.READ), allowNull:false,
        defaultValue: NotificationStatus.UNREAD})
    status: NotificationStatus;
}