import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservations } from './entities/reservation.entity';
import { TablesModule } from '../tables/tables.module';
import { Platos } from '../platos/entities/platos.entity';
import { Pedidos } from '../pedidos/entities/pedido.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservations, Platos, Pedidos]),
    TablesModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
