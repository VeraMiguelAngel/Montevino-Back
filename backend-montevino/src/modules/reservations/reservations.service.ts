import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservations } from './entities/reservation.entity';
import { Repository } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { TablesService } from '../tables/tables.service';
import { Pedidos } from '../pedidos/entities/pedido.entity';
import { Platos } from '../platos/entities/platos.entity';
import { Users } from '../users/entities/user.entity';
import { reservationStatus } from './reservation-status.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservations)
    private reservationsRepository: Repository<Reservations>,
    @InjectRepository(Pedidos)
    private pedidosRepository: Repository<Pedidos>,
    @InjectRepository(Platos)
    private platosRepository: Repository<Platos>,
    private tablesService: TablesService,
  ) {}

  async create(createReservationDto: CreateReservationDto, user) {
    const { pedidos, ...reservationData } = createReservationDto;

    const existingReservation = await this.reservationsRepository.findOne({
      where: {
        user: { id: user.id },
        reservationDate: reservationData.reservationDate,
        status: reservationStatus.CONFIRMADA,
      },
    });

    if (existingReservation) {
      throw new BadRequestException(
        'Ya tenés una reserva confirmada para este día',
      );
    }

    const reservationDate = new Date(createReservationDto.reservationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      throw new BadRequestException('No se puede reservar en fechas pasadas');
    }

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    if (reservationDate > maxDate) {
      throw new BadRequestException(
        'No se puede reservar con tanta anticipación',
      );
    }

    const hour = parseInt(createReservationDto.startTime.split(':')[0]);

    if (hour < 18 || hour > 23) {
      throw new BadRequestException(
        'Las reservas solo se pueden hacer entre las 18:00 y 23:00',
      );
    }

    const reservation = this.reservationsRepository.create({
      ...reservationData,
      user: user,
      table: null,
      totalPrice: 0,
      depositAmount: 0,
    });

    await this.reservationsRepository.save(reservation);

    let total = 0;

    if (pedidos && pedidos.length > 0) {
      for (const pedido of pedidos) {
        const plato = await this.platosRepository.findOne({
          where: { id: pedido.platoId },
        });

        if (!plato) {
          throw new NotFoundException('Plato no encontrado');
        }

        if (plato.stock < pedido.quantity) {
          throw new BadRequestException(
            `No hay suficiente stock de ${plato.name}`,
          );
        }

        plato.stock -= pedido.quantity;
        await this.platosRepository.save(plato);

        const price = Number(plato.price) * pedido.quantity;

        const newPedido = this.pedidosRepository.create({
          quantity: pedido.quantity,
          price,
          menuItem: plato,
          reservation,
        });

        await this.pedidosRepository.save(newPedido);

        total += price;
      }
    }

    reservation.totalPrice = total;

    const baseAmount = 2000 * reservation.peopleCount;

    if (total > 0) {
      reservation.depositAmount = baseAmount + Number(total) * 0.15;
    } else {
      reservation.depositAmount = baseAmount + 5000;
    }

    await this.reservationsRepository.save(reservation);

    return {
      message: 'Reserva creada. Pendiente de pago.',
      reservationId: reservation.id,
      reservationDate: reservation.reservationDate,
      startTime: reservation.startTime,
      peopleCount: reservation.peopleCount,
      totalPrice: Number(reservation.totalPrice),
      depositAmount: Number(reservation.depositAmount),
      status: reservation.status,
      table: null,
      pedidos:
        pedidos && pedidos.length > 0
          ? pedidos.map((pedido) => ({
              platoId: pedido.platoId,
              quantity: pedido.quantity,
            }))
          : [],
    };
  }

  async findAll() {
    const reservations = await this.reservationsRepository.find({
      relations: ['table', 'user', 'pedidos', 'pedidos.menuItem'],
    });

    return reservations.map((res) => ({
      id: res.id,
      reservationDate: res.reservationDate,
      startTime: res.startTime,
      peopleCount: res.peopleCount,
      totalPrice: Number(res.totalPrice),
      depositAmount: Number(res.depositAmount),
      status: res.status,

      user: {
        name: res.user.name,
        email: res.user.email,
      },

      table: res.table
        ? {
            tableNumber: res.table.tableNumber,
          }
        : null,

      pedidos: res.pedidos.map((p) => ({
        quantity: p.quantity,
        price: Number(p.price),
        name: p.menuItem.name,
      })),
    }));
  }

  async findByUser(userId: string) {
    const reservations = await this.reservationsRepository.find({
      where: { user: { id: userId } },
      relations: ['table', 'pedidos', 'pedidos.menuItem'],
    });

    return reservations.map((res) => ({
      id: res.id,
      reservationDate: res.reservationDate,
      startTime: res.startTime,
      peopleCount: res.peopleCount,
      totalPrice: Number(res.totalPrice),
      depositAmount: Number(res.depositAmount),
      status: res.status,

      table: res.table
        ? {
            tableNumber: res.table.tableNumber,
          }
        : null,

      pedidos: res.pedidos.map((p) => ({
        quantity: p.quantity,
        price: Number(p.price),
        name: p.menuItem.name,
      })),
    }));
  }

  async findOne(id: string) {
    return await this.reservationsRepository.findOne({
      where: { id },
      relations: ['table', 'user', 'pedidos', 'pedidos.menuItem'],
    });
  }

  async cancel(reservationId: string, user: Users) {
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId },
      relations: ['pedidos', 'pedidos.menuItem', 'user', 'table'],
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.user.id !== user.id) {
      throw new ForbiddenException('No podés cancelar esta reserva');
    }

    if (reservation.status === reservationStatus.CANCELADA) {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    for (const pedido of reservation.pedidos) {
      pedido.menuItem.stock += pedido.quantity;
      await this.platosRepository.save(pedido.menuItem);
    }

    reservation.status = reservationStatus.CANCELADA;

    await this.reservationsRepository.save(reservation);

    return {
      message: 'Reserva cancelada correctamente',
      reservationId: reservation.id,
      status: reservation.status,
    };
  }

  async save(reservation: any) {
    return await this.reservationsRepository.save(reservation);
  }
}
