import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsMilitaryTime,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreatePedidoDto } from 'src/modules/pedidos/dto/create-pedido.dto';

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  reservationDate: string;

  @IsString()
  @IsNotEmpty()
  @IsMilitaryTime({ message: 'El horario debe tener formato HH:MM (24hs)' })
  startTime: string;

  @IsNumber()
  @Min(1)
  peopleCount: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoDto)
  pedidos?: CreatePedidoDto[];
}
