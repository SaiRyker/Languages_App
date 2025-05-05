import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {StudentGroupsService} from "./student_groups.service";
import {ApiResponse} from "@nestjs/swagger";
import {StudentGroup} from "./student_groups.model";
import {CreateGroupDto} from "./dto/create-group.dto";
import {addStudentsDto} from "./dto/add-students.dto";
import {addCourseDto} from "./dto/add-course.dto";
import {Course} from "../courses/courses.model";
import {User} from "../users/user.model";

@Controller('groups')
export class StudentGroupsController {
    constructor(private readonly studentGroupsService: StudentGroupsService) {
    }

    @Post()
    async createGroup(@Body() dto: CreateGroupDto) {
        return this.studentGroupsService.createStudentGroup(dto);
    }

    @Post('/add-students')
    async addStudents(@Body() dto: addStudentsDto) {
        return this.studentGroupsService.addStudentsToGroup(dto);
    }

    @Post('/add-courses')
    async addCourses(@Body() dto: addCourseDto) {
        return this.studentGroupsService.addCourseToGroup(dto);
    }

    @Get('/:group_id/students')
    async getGroupStudents(@Param('group_id') group_id: number): Promise<User[]> {
        return this.studentGroupsService.getGroupStudents(group_id)
    }

    @Get('/:group_id/courses')
    async getGroupCourses(@Param('group_id') group_id: number): Promise<Course[]> {
        return this.studentGroupsService.getGroupCourses(group_id)
    }
}
