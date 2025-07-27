export class CreateNotifDto {
    readonly user_id: number;
    readonly creator_id: number;
    readonly title: string;
    readonly content: string;
}