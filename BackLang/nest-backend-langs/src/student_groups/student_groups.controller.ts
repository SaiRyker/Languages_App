import {Body, Controller, Get, Param, Post, Query, Req, UnauthorizedException} from '@nestjs/common';
import {StudentGroupsService} from "./student_groups.service";
import {ApiResponse} from "@nestjs/swagger";
import {StudentGroup} from "./student_groups.model";
import {CreateGroupDto} from "./dto/create-group.dto";
import {addStudentsDto} from "./dto/add-students.dto";
import {addCourseDto} from "./dto/add-course.dto";
import {Course} from "../courses/courses.model";
import {User} from "../users/user.model";
import {GroupStudent} from "./group-students.model";
import {GetUser} from "../common/decorators/user.decorator";
import {removeStudentsDto} from "./dto/remove-students.dto";
import {removeCoursesDto} from "./dto/remove-courses.dto";

@Controller('groups')
export class StudentGroupsController {
    constructor(private readonly studentGroupsService: StudentGroupsService) {
    }

    @Post()
    async create(@Body() createGroupDto: CreateGroupDto): Promise<StudentGroup> {
        return this.studentGroupsService.createStudentGroup(createGroupDto);
    }

    @Get()
    async getAll(
        @Query('curatedOnly') curatedOnly: string,
        @Query('userId') queryUserId: string,
        @GetUser() user,
    ): Promise<StudentGroup[]> {
        const isCuratedOnly = curatedOnly === 'true';
        console.log('getAll параметры:', { curatedOnly, queryUserId, user });

        const userId = user?.id ? user.id : queryUserId ? parseInt(queryUserId) : null;
        if (!userId) {
            throw new UnauthorizedException('Не указан ID пользователя');
        }
        return this.studentGroupsService.getAllGroups(isCuratedOnly, userId);
    }


    @Post('/add-students')
    async addStudents(@Body() dto: addStudentsDto) {
        return this.studentGroupsService.addStudentsToGroup(dto);
    }

    @Post('/add-courses')
    async addCourses(@Body() dto: addCourseDto) {
        return this.studentGroupsService.addCourseToGroup(dto);
    }

    @Post('/remove-students')
    async removeStudents(@Body() dto: removeStudentsDto) {
        console.log(dto);
        return this.studentGroupsService.removeStudentsFromGroup(dto);
    }

    @Post('/remove-courses')
    async removeCourses(@Body() dto: removeCoursesDto) {
        return this.studentGroupsService.removeCoursesFromGroup(dto);
    }

    @Get('/:group_id/students')
    async getGroupStudents(@Param('group_id') group_id: number): Promise<User[]> {
        return this.studentGroupsService.getGroupStudents(group_id)
    }

    @Get('/:group_id/courses')
    async getGroupCourses(@Param('group_id') group_id: number): Promise<Course[]> {
        return this.studentGroupsService.getGroupCourses(group_id)
    }

    @Get('/userGroup/:student_id')
    async getUserGroup(@Param('student_id') student_id: number){
        return this.studentGroupsService.getGroupsByUserId(student_id)
    }
}
