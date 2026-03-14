import { IsNumber, IsUUID } from "class-validator";

export class CreatePedidoDto {
  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  menuItemId: number;

  @IsUUID()
  reservationId: string;
}
