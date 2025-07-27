import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserNotificationsService } from './user_notifications.service';
import { Notification } from './user_notifications.model';
import { CreateNotifDto } from './dto/create-notif.dto';
import { CreateBulkNotifDto } from './dto/create-bulk-notif.dto';
import { UpdateNotifStatusDto } from './dto/update-notif-status.dto';
import { User } from '../users/user.model';

@Controller('user_notifications')
export class UserNotificationsController {
    constructor(private notifService: UserNotificationsService) {}

    @ApiOperation({ summary: 'Создание уведомления для одного пользователя' })
    @ApiResponse({ status: 200, type: Notification })
    @Post()
    create(@Body() notifDto: CreateNotifDto) {
        return this.notifService.createNotification(notifDto);
    }

    @ApiOperation({ summary: 'Создание уведомлений для нескольких пользователей' })
    @ApiResponse({ status: 200, type: [Notification] })
    @Post('bulk')
    createBulk(@Body() bulkNotifDto: CreateBulkNotifDto) {
        return this.notifService.createBulkNotification(bulkNotifDto);
    }

    @ApiOperation({ summary: 'Получение уведомлений пользователя' })
    @ApiResponse({ status: 200, type: [Notification] })
    @Get('user/:userId')
    getForUser(@Param('userId') userId: number) {
        return this.notifService.getUserNotifications(userId);
    }

    @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
    @ApiResponse({ status: 200, type: Notification })
    @Patch(':notificationId/read')
    markAsRead(@Param('notificationId') notificationId: number) {
        return this.notifService.markAsRead(notificationId);
    }

    @ApiOperation({ summary: 'Получение всех пользователей с ролями' })
    @ApiResponse({ status: 200, type: [User] })
    @Get('users')
    getAllUsers() {
        return this.notifService.getAllUsersWithRoles();
    }
}