import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {StudentGroup} from "./student_groups.model";
import {GroupStudent} from "./group-students.model";
import {CreateGroupDto} from "./dto/create-group.dto";
import {GroupCourse} from "./group-courses.model";
import {User} from "../users/user.model";
import {addStudentsDto} from "./dto/add-students.dto";
import {addCourseDto} from "./dto/add-course.dto";
import {Course} from "../courses/courses.model";
import {Language} from "../prog_langs/prog_langs.model";
import {UserProgressService} from "../user_progress/user_progress.service";
import {removeCoursesDto} from "./dto/remove-courses.dto";
import {removeStudentsDto} from "./dto/remove-students.dto";

@Injectable()
export class StudentGroupsService {
    constructor(@InjectModel(StudentGroup) private stGroupRep: typeof StudentGroup,
                @InjectModel(GroupCourse) private courseGrRep: typeof GroupCourse,
                @InjectModel(GroupStudent) private studGroupRep: typeof GroupStudent,
                private progressService: UserProgressService) {}

    async createStudentGroup(dto: CreateGroupDto) {
        const groupData = {
            group_name: dto.group_name,
            curator_id: dto.curator_id
        };
        const group = await this.stGroupRep.create(groupData);
        return group;
    }

    async getAllGroups(curatedOnly: boolean, userId: number): Promise<StudentGroup[]> {
        const where = curatedOnly ? { curator_id: userId } : {};
        return this.stGroupRep.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'curator',
                    attributes: ['id_user', 'user_fio'],
                },
            ],
        });
    }

    async addStudentsToGroup(dto: addStudentsDto) {
        const group = await this.stGroupRep.findByPk(dto.group_id, {include: {all: true}});
        if (!group) {
            throw new NotFoundException("Group Not found");
        }

        if (!Array.isArray(dto.student_ids)) {
            throw new BadRequestException('student_ids must be an array of numbers');
        }

            for (const studId of dto.student_ids) {
                if (typeof studId !== 'number') {
                    throw new BadRequestException('All student_ids must be numbers');
                }

                await this.studGroupRep.create({
                    group_id: dto.group_id,
                    student_id: studId
                });

                const groupCourses = await this.courseGrRep.findAll({
                    where: { group_id: dto.group_id },
                });
                const courseIds = groupCourses.map(c => c.get("course_id"));
                for (const courseId of courseIds) {
                    await this.progressService.createProgressForStudent(studId, Number(courseId));
                }
            }
            return group;
    }

    async addCourseToGroup(dto: addCourseDto) {
        const group = await this.stGroupRep.findByPk(dto.group_id, {include: {all: true}});

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        if (!Array.isArray(dto.course_ids)) {
            throw new BadRequestException('course_ids must be an array of numbers');
        }

        for (const courseId of dto.course_ids) {
            if (typeof courseId !== 'number') {
                throw new BadRequestException('All course_ids must be numbers');
            }

            await this.courseGrRep.create({
                group_id: dto.group_id,
                course_id: courseId
            })

            const groupStudents = await this.studGroupRep.findAll({
                where: { group_id: dto.group_id },
                attributes: ['student_id'],
            });
            const studentIds = groupStudents.map(s => s.get("student_id"));
            await this.progressService.createProgressForStudents(studentIds, courseId);
        }
        return group;
    }

    async removeStudentsFromGroup(dto: removeStudentsDto) {
        console.log(dto.group_id)
        const group = await this.stGroupRep.findByPk(dto.group_id);
        console.log(group)
        if (!group) {
            throw new NotFoundException('Group not found');
        }
        const deleted = await this.studGroupRep.destroy({
            where: {
                group_id: dto.group_id,
                student_id: dto.student_ids,
            },
        });
        if (deleted === 0) {
            throw new NotFoundException('No students found to remove');
        }
        return { message: 'Students removed successfully' };
    }

    async removeCoursesFromGroup(dto: removeCoursesDto) {
        const group = await this.stGroupRep.findByPk(dto.group_id);
        if (!group) {
            throw new NotFoundException('Group not found');
        }
        await group.$remove('courses', dto.course_ids);
        return { message: 'Courses removed successfully' };
    }

    async getGroupStudents(groupId: number): Promise<User[]> {
        const group = await this.stGroupRep.findByPk(groupId, {
            include: [
                {
                    model: User,
                    as: 'students',
                    through: { attributes: [] },
                },
            ],
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        const students = group.get("students")
        return students;
    }

    async getGroupCourses(groupId: number): Promise<Course[]> {
        const group = await this.stGroupRep.findByPk(groupId, {
            include: [
                {
                    model: Course,
                    as: 'courses',
                    through: { attributes: [] },
                    include: [
                        {
                            model: Language,
                            attributes: ['lang_name'],
                        }
                    ]
                },
            ],
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        const courses = group.get("courses")
        return courses;
    }

    async getGroupsByUserId(student_id: number) {
        const groups = await this.studGroupRep.findAll({
            where: { student_id: student_id },
            include: [{
                model: StudentGroup,
                include: [{ model: User, as: 'curator'}],
            }]
        })
        return groups.map((gs) => gs.get("group"))
    }
}
