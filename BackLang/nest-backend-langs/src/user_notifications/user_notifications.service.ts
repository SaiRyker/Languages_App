import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Notification, NotificationStatus } from './user_notifications.model';
import { CreateNotifDto } from './dto/create-notif.dto';
import { CreateBulkNotifDto } from './dto/create-bulk-notif.dto';
import { User } from '../users/user.model';
import { UpdateNotifStatusDto } from './dto/update-notif-status.dto';
import { Role } from '../roles/roles.model';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class UserNotificationsService {
    constructor(
        @InjectModel(Notification) private notificationRepository: typeof Notification,
        @InjectModel(User) private userRepository: typeof User,
    ) {}

    async createNotification(dto: CreateNotifDto) {
        const notif = await this.notificationRepository.create(dto);
        return notif;
    }

    async createBulkNotification(dto: CreateBulkNotifDto) {
        const { creator_id, title, content, user_ids, roles } = dto;
        let recipients: User[] = [];

        const validRoles = ['student', 'teacher', 'admin'];
        const filteredRoles = roles ? roles.filter((role) => validRoles.includes(role)) : [];

        if (user_ids && user_ids.length > 0) {
            recipients = await this.userRepository.findAll({
                where: { id_user: user_ids },
            });
        } else if (filteredRoles.length > 0) {
            recipients = await this.userRepository.findAll({
                include: [
                    {
                        model: Role,
                        where: { role_name: filteredRoles },
                        through: { attributes: [] },
                    },
                ],
            });
        } else {
            recipients = await this.userRepository.findAll();
        }

        if (recipients.length === 0) {
            throw new Error('Нет получателей для уведомления');
        }

        const notifications = await Promise.all(
            recipients.map((user) =>
                this.notificationRepository.create({
                    user_id: user.id_user,
                    creator_id,
                    title,
                    content,
                }),
            ),
        );

        return notifications;
    }

    async getUserNotifications(userId: number): Promise<Notification[]> {
        const notifs = await this.notificationRepository.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: User,
                    attributes: { exclude: ['user_login', 'user_password', 'user_email'] },
                    as: 'user',
                },
                {
                    model: User,
                    attributes: { exclude: ['user_login', 'user_password', 'user_email'] },
                    as: 'creator',
                },
            ],
            order: [['sent_date', 'DESC']],
            raw: false,
        });
        return notifs;
    }

    async markAsRead(notificationId: number): Promise<Notification | null> {
        const [affectedCount] = await this.notificationRepository.update(
            { status: NotificationStatus.READ },
            { where: { id_notification: notificationId }, returning: true },
        );
        if (affectedCount === 0) {
            throw new Error('Notification not found or not updated');
        }
        const notif = await this.notificationRepository.findByPk(notificationId, { raw: false });
        return notif;
    }

    async getAllUsersWithRoles(): Promise<User[]> {
        return await this.userRepository.findAll({
            attributes: ['id_user', 'user_fio'],
            include: [
                {
                    model: Role,
                    attributes: ['role_name'],
                    through: { attributes: [] },
                },
            ],
            raw: false,
        });
    }
}