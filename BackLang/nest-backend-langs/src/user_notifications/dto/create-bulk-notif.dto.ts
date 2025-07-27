export class CreateBulkNotifDto {
    creator_id: number;
    title: string;
    content: string;
    user_ids?: number[]; // Конкретные пользователи (опционально)
    roles?: string[]; // Роли: student, teacher, admin (опционально)
}