import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedidos } from './entities/pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pedidos])],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
