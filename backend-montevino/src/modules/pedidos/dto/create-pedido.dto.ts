import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreatePedidoDto {
  @IsUUID()
  @IsNotEmpty()
  platoId: string;

  @IsNumber()
  @Min(1, { message: 'La cantidad mínima es 1' })
  quantity: number;
}
