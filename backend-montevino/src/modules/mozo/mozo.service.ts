import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HostOrder, hostOrderStatus } from '../host/entities/host-order.entity';
import { Pedidos, pedidoStatus } from '../pedidos/entities/pedido.entity';
import { Platos } from '../platos/entities/platos.entity';

@Injectable()
export class MozoService {
  constructor(
    @InjectRepository(HostOrder)
    private hostOrderRepo: Repository<HostOrder>,
    @InjectRepository(Pedidos)
    private pedidosRepo: Repository<Pedidos>,
    @InjectRepository(Platos)
    private platosRepo: Repository<Platos>,
  ) {}

  // Ver todas las órdenes activas
  async getActiveOrders() {
    return this.hostOrderRepo.find({
      where: { status: hostOrderStatus.EN_CURSO },
      relations: [
        'reservation',
        'reservation.user',
        'reservation.table',
        'reservation.pedidos',
        'reservation.pedidos.menuItem',
      ],
      order: { checkInTime: 'ASC' },
    });
  }

  // Ver detalle de una orden
  async getOrder(hostOrderId: string) {
    const order = await this.hostOrderRepo.findOne({
      where: { id: hostOrderId },
      relations: [
        'reservation',
        'reservation.pedidos',
        'reservation.pedidos.menuItem',
        'reservation.table',
        'reservation.user',
      ],
    });
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  // Marcar pedido como entregado
  async deliverPedido(pedidoId: string) {
    const pedido = await this.pedidosRepo.findOne({ where: { id: pedidoId } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');

    if (pedido.status !== pedidoStatus.EN_PREPARACION) {
      throw new BadRequestException(
        'El pedido debe estar en preparación para poder entregarlo',
      );
    }

    pedido.status = pedidoStatus.ENTREGADO;
    return this.pedidosRepo.save(pedido);
  }

  // Agregar platillo extra
  async addPedido(hostOrderId: string, platoId: string, quantity: number) {
    const order = await this.hostOrderRepo.findOne({
      where: { id: hostOrderId },
      relations: ['reservation'],
    });
    if (!order) throw new NotFoundException('Orden no encontrada');

    const plato = await this.platosRepo.findOne({ where: { id: platoId } });
    if (!plato) throw new NotFoundException('Plato no encontrado');

    const pedido = this.pedidosRepo.create({
      quantity,
      price: plato.price,
      menuItem: { id: platoId } as any,
      reservation: { id: order.reservation.id } as any,
      status: pedidoStatus.EN_PREPARACION,
      isExtra: true,
    });

    return this.pedidosRepo.save(pedido);
  }

  // Cerrar la orden
  async closeOrder(hostOrderId: string) {
    const order = await this.hostOrderRepo.findOne({
      where: { id: hostOrderId },
      relations: [
        'reservation',
        'reservation.pedidos',
        'reservation.pedidos.menuItem',
      ],
    });
    if (!order) throw new NotFoundException('Orden no encontrada');

    const reservation = order.reservation;

    // Verificar que todos los pedidos estén entregados
    const pendientes = reservation.pedidos.filter(
      (p) => p.status !== pedidoStatus.ENTREGADO,
    );

    if (pendientes.length > 0) {
      throw new BadRequestException(
        `Hay ${pendientes.length} pedido/s sin entregar. Debés entregar todos antes de cerrar la mesa.`,
      );
    }

    const prePedidos = reservation.pedidos.filter((p) => !p.isExtra);
    const extras = reservation.pedidos.filter((p) => p.isExtra);

    const totalPrePedidos = prePedidos.reduce(
      (acc, p) => acc + Number(p.price) * p.quantity,
      0,
    );
    const totalExtras = extras.reduce(
      (acc, p) => acc + Number(p.price) * p.quantity,
      0,
    );

    const restantePrePedidos = totalPrePedidos * 0.85;
    const totalACobrar = restantePrePedidos + totalExtras;

    order.status = hostOrderStatus.FINALIZADA;
    await this.hostOrderRepo.save(order);

    reservation.status = 'FINALIZADA' as any;
    await this.hostOrderRepo.manager.save(reservation);

    return {
      message: 'Orden cerrada correctamente',
      depositAmount: reservation.depositAmount,
      restantePrePedidos: Number(restantePrePedidos.toFixed(2)),
      totalExtras: Number(totalExtras.toFixed(2)),
      totalACobrar: Number(totalACobrar.toFixed(2)),
    };
  }
}
