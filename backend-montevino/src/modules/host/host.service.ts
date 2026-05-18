import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HostOrder } from './entities/host-order.entity';
import { Reservations } from '../reservations/entities/reservation.entity';
import { Pedidos, pedidoStatus } from '../pedidos/entities/pedido.entity';
import { reservationStatus } from '../reservations/reservation-status.enum';

@Injectable()
export class HostService {
  constructor(
    @InjectRepository(HostOrder)
    private hostOrderRepo: Repository<HostOrder>,
    @InjectRepository(Reservations)
    private reservationsRepo: Repository<Reservations>,
    @InjectRepository(Pedidos)
    private pedidosRepo: Repository<Pedidos>,
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

  // Ver reservas confirmadas de fechas siguientes
  async getReservationsByDate(date: string) {
    return this.reservationsRepo.find({
      where: {
        reservationDate: date,
        status: reservationStatus.CONFIRMADA,
      },
      relations: ['user', 'table', 'pedidos', 'pedidos.menuItem'],
      order: { startTime: 'ASC' },
    });
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
}
