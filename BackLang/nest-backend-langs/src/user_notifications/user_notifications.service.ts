import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Notification} from "./user_notifications.model";
import {CreateNotifDto} from "./dto/create-notif.dto";
import {User} from "../users/user.model";

@Injectable()
export class UserNotificationsService {
    constructor(@InjectModel(Notification) private notificationRepository: typeof Notification) {}

    async createNotification(dto: CreateNotifDto) {
        const notif = await this.notificationRepository.create(dto);
        return notif;
    }

    async getUserNotifications(userId: number): Promise<Notification[]> {
        const notifs = this.notificationRepository.findAll({
            where: {user_id: userId},
            include: [{
                model: User,
                attributes: {exclude: ['user_login', 'user_password', 'user_email']}
            }],
            order: [['sent_date', 'DESC']]
        });
        return notifs;
    }

    // async markAsRead() {
    //
    // }


}
