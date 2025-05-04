import {Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {UserNotificationsService} from "./user_notifications.service";
import {Notification} from "./user_notifications.model";
import {CreateNotifDto} from "./dto/create-notif.dto";

@Controller('user_notifications')
export class UserNotificationsController {

    constructor(private notifService: UserNotificationsService) {}


    @ApiOperation({ summary: 'Создание уведомления для пользователя' })
    @ApiResponse({status: 200, type: Notification})
    @Post()
    create(@Body() notifDto: CreateNotifDto) {
        return this.notifService.createNotification(notifDto);
    }

    @ApiOperation({ summary: 'Создание уведомления для пользователя' })
    @ApiResponse({status: 200, type: Notification})
    @Get('user/:userId')
    getForUser(@Param('userId') userId: number) {
        return this.notifService.getUserNotifications(userId);
    }

}
