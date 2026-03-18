import { IsNumber } from 'class-validator';

export class CreateTableDto {
  @IsNumber()
  tableNumber: number;
}
