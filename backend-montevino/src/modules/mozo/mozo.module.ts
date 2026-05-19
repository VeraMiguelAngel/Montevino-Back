import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MozoService } from './mozo.service';
import { MozoController } from './mozo.controller';
import { HostOrder } from '../host/entities/host-order.entity';
import { Reservations } from '../reservations/entities/reservation.entity';
import { Pedidos } from '../pedidos/entities/pedido.entity';
import { Platos } from '../platos/entities/platos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HostOrder, Reservations, Pedidos, Platos]),
  ],
  controllers: [MozoController],
  providers: [MozoService],
})
export class MozoModule {}
