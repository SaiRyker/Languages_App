import {HttpException, HttpStatus, Injectable, NotFoundException} from '@nestjs/common';
import {User} from "./user.model";
import {InjectModel} from "@nestjs/sequelize";
import {CreateUserDto} from "./dto/create-user.dto";
import {RolesService} from "../roles/roles.service";
import {Role} from "../roles/roles.model";
import {addRoleDto} from "../roles/dto/add-role.dto";
import {StudentGroupsService} from "../student_groups/student_groups.service";
import {Course} from "../courses/courses.model";
import {StudentGroup} from "../student_groups/student_groups.model";

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private userRepository: typeof User,
                private roleService: RolesService,
                private studentGroupsService: StudentGroupsService,) {}

    async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto);
        const role = await this.roleService.getRoleByValue(dto.role_name);

        if (!role) {
            throw new NotFoundException("Role Not Found");
        }

        await user.$set('roles', [role.dataValues.id_role])
        user.roles = [role.dataValues]
        console.log(user)
        return user;
    }

    async getAllUser() {
        const users = await this.userRepository.findAll({include: {all: true}});
        return users;
    }

    async getUserByEmail(user_email: string) {

        if (!user_email) {
            throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
        }

        const user = await this.userRepository.findOne({where: {user_email},
            include: {all: true}});
        return user;
    }

    async  addRole(dto: addRoleDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.roleName);
        if (role && user) {
            const tempRoleId = role.get("id_role")
            await user.$add('role', tempRoleId);
            return dto;
        }

        throw new HttpException('Role already exists', HttpStatus.NOT_FOUND);
    }

    async getUserCourses(user_id: number): Promise<Course[]> {
        console.log('Fetching groups for userId:', user_id);
        const groups = await this.studentGroupsService.getGroupsByUserId(user_id);
        console.log('Groups found:', groups);
        if (!groups || groups.length === 0) {
            return [];
        }

        const groupIds = groups.map((group) => group.get("id_group"));
        console.log('Fetching courses for groupId:', groupIds[0]);
        const courses = await this.studentGroupsService.getGroupCourses(groupIds[0]);
        console.log('Courses found:', courses);
        return courses;
    }

    async getUserGroups(user_id: number): Promise<StudentGroup[]> {
        return this.studentGroupsService.getGroupsByUserId(user_id);
    }
}
