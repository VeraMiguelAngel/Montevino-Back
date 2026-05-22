import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HostOrder, hostOrderStatus } from './entities/host-order.entity';
import { Reservations } from '../reservations/entities/reservation.entity';
import { Pedidos, pedidoStatus } from '../pedidos/entities/pedido.entity';
import { reservationStatus } from '../reservations/reservation-status.enum';
import { Platos } from '../platos/entities/platos.entity';

@Injectable()
export class HostService {
  constructor(
    @InjectRepository(HostOrder)
    private hostOrderRepo: Repository<HostOrder>,
    @InjectRepository(Reservations)
    private reservationsRepo: Repository<Reservations>,
    @InjectRepository(Pedidos)
    private pedidosRepo: Repository<Pedidos>,
    @InjectRepository(Platos)
    private platosRepo: Repository<Platos>,
  ) {}

  // Ver reservas confirmadas del día actual
  async getTodayReservations() {
    const today = new Date().toISOString().split('T')[0];
    return this.reservationsRepo.find({
      where: {
        reservationDate: today,
        status: reservationStatus.CONFIRMADA,
      },
      relations: ['user', 'table', 'pedidos', 'pedidos.menuItem'],
      order: { startTime: 'ASC' },
    });
  }

  // Ver reservas confirmadas de fechas siguientes y pasadas
  async getReservationsByDate(date: string) {
    const reservations = await this.reservationsRepo.find({
      where: [
        { reservationDate: date, status: reservationStatus.CONFIRMADA },
        { reservationDate: date, status: reservationStatus.EN_CURSO },
      ],
      relations: ['user', 'table', 'pedidos', 'pedidos.menuItem'],
      order: { startTime: 'ASC' },
    });
    console.log(
      'Primera reserva table:',
      JSON.stringify(reservations[0]?.table),
    );
    return reservations;
  }

  // Check-in: marcar llegada del cliente y generar HostOrder
  async checkIn(reservationId: string, hostId: string) {
    const reservation = await this.reservationsRepo.findOne({
      where: { id: reservationId },
      relations: ['user', 'table', 'pedidos', 'pedidos.menuItem'],
    });

    if (!reservation) throw new NotFoundException('Reserva no encontrada');
    if (reservation.status !== reservationStatus.CONFIRMADA) {
      throw new BadRequestException('La reserva no está confirmada');
    }

    // Cambiar estado de la reserva a EN_CURSO
    reservation.status = reservationStatus.EN_CURSO;
    await this.reservationsRepo.save(reservation);

    // Crear la HostOrder
    const hostOrder = this.hostOrderRepo.create({
      reservation: { id: reservationId },
      host: { id: hostId },
    });
    const savedOrder = await this.hostOrderRepo.save(hostOrder);

    return {
      hostOrderId: savedOrder.id,
      checkInTime: savedOrder.checkInTime,
      table: reservation.table,
      peopleCount: reservation.peopleCount,
      client: reservation.user,
      pedidos: reservation.pedidos,
    };
  }

  // Ver detalle de una HostOrder
  async getHostOrder(hostOrderId: string) {
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

  // Marcar un pedido como entregado
  async deliverPedido(pedidoId: string) {
    const pedido = await this.pedidosRepo.findOne({ where: { id: pedidoId } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    pedido.status = pedidoStatus.ENTREGADO;
    return this.pedidosRepo.save(pedido);
  }

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
      status: pedidoStatus.PENDIENTE,
      isExtra: true,
    });

    return this.pedidosRepo.save(pedido);
  }

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

    await this.reservationsRepo.save({
      ...reservation,
      status: reservationStatus.FINALIZADA,
    });

    return {
      message: 'Orden cerrada correctamente',
      depositAmount: reservation.depositAmount,
      restantePrePedidos: Number(restantePrePedidos.toFixed(2)),
      totalExtras: Number(totalExtras.toFixed(2)),
      totalACobrar: Number(totalACobrar.toFixed(2)),
    };
  }

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

  async getClosedOrders() {
    return this.hostOrderRepo.find({
      where: { status: hostOrderStatus.FINALIZADA },
      relations: [
        'reservation',
        'reservation.user',
        'reservation.table',
        'reservation.pedidos',
        'reservation.pedidos.menuItem',
      ],
      order: { checkInTime: 'DESC' },
    });
  }

  async getPendingReservations() {
    return this.reservationsRepo.find({
      where: { status: reservationStatus.PAGO_PENDIENTE },
      relations: ['user', 'table', 'pedidos', 'pedidos.menuItem'],
      order: { reservationDate: 'ASC' },
    });
  }

  async cancelReservation(reservationId: string) {
    const reservation = await this.reservationsRepo.findOne({
      where: { id: reservationId },
      relations: ['pedidos', 'pedidos.menuItem'],
    });

    if (!reservation) throw new NotFoundException('Reserva no encontrada');

    if (reservation.status === reservationStatus.CANCELADA) {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    reservation.status = reservationStatus.CANCELADA;
    await this.reservationsRepo.save(reservation);

    return { message: 'Reserva cancelada correctamente' };
  }

  async activarPedidos(hostOrderId: string) {
    const order = await this.hostOrderRepo.findOne({
      where: { id: hostOrderId },
      relations: ['reservation', 'reservation.pedidos'],
    });
    if (!order) throw new NotFoundException('Orden no encontrada');

    const pedidos = order.reservation.pedidos.filter(
      (p) => p.status === pedidoStatus.PENDIENTE && !p.isExtra,
    );

    for (const pedido of pedidos) {
      pedido.status = pedidoStatus.EN_PREPARACION;
      await this.pedidosRepo.save(pedido);
    }

    return { message: `${pedidos.length} pedidos enviados a cocina` };
  }
}
