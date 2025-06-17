import { ApiProperty } from '@nestjs/swagger';

class ModuleOrderItem {
    @ApiProperty({ type: Number, description: 'ID модуля' })
    id_module: number;

    @ApiProperty({ type: Number, description: 'Порядковый номер модуля' })
    order_number: number;
}

export class UpdateModuleOrderDto {
    @ApiProperty({ type: [ModuleOrderItem], description: 'Массив объектов с ID модуля и порядковым номером' })
    moduleOrder: { id_module: number; order_number: number }[];
}