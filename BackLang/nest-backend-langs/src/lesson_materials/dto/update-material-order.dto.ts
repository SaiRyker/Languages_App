import { IsArray, ValidateNested} from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

class MaterialOrderItem {
    @IsInt()
    id_material: number;

    @IsInt()
    order_number: number;
}

export class UpdateMaterialOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaterialOrderItem)
    materialOrder: MaterialOrderItem[];
}