import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Progress} from "./user_progress.model";

@Injectable()
export class UserProgressService {
    constructor(@InjectModel(Progress) private progressRep: typeof Progress,
    ) {}

    async createProgressForStudent(studentId: number, courseId: number): Promise<Progress> {
        return this.progressRep.create({
            student_id: studentId,
            course_id: courseId,
        });
    }

    async createProgressForStudents(studentIds: number[], courseId: number): Promise<Progress[]> {
        const progressRecords = studentIds.map(studentId =>
            this.createProgressForStudent(studentId, courseId)
        );
        return Promise.all(progressRecords);
    }
}
