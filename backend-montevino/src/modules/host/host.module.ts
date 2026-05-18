import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostOrder } from './entities/host-order.entity';
import { HostService } from './host.service';
import { HostController } from './host.controller';
import { Reservations } from '../reservations/entities/reservation.entity';
import { Pedidos } from '../pedidos/entities/pedido.entity';
import { Platos } from '../platos/entities/platos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HostOrder, Reservations, Pedidos, Platos]),
  ],
  controllers: [HostController],
  providers: [HostService],
})
export class HostModule {}
