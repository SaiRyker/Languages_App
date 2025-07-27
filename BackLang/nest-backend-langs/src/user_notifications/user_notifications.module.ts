import { Module } from '@nestjs/common';
import { UserNotificationsService } from './user_notifications.service';
import { UserNotificationsController } from './user_notifications.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/user.model';
import { Notification } from './user_notifications.model';
import { Role } from '../roles/roles.model';

@Module({
  providers: [UserNotificationsService],
  controllers: [UserNotificationsController],
  imports: [
    SequelizeModule.forFeature([Notification, User, Role]),
  ],
  exports: [UserNotificationsService],
})
export class UserNotificationsModule {}