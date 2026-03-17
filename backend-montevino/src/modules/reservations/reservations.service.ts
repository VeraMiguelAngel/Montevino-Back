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
import { ReservationResponseDto } from './dto/reservation-response.dto';
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
      },
    });

    if (existingReservation) {
      throw new BadRequestException('Ya tenés una reserva para este día');
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

    const table = await this.tablesService.findAvailableTable(
      createReservationDto.reservationDate,
      createReservationDto.startTime,
    );

    if (!table) {
      throw new NotFoundException('No hay mesas disponibles');
    }

    const reservation = this.reservationsRepository.create({
      ...reservationData,
      user: user,
      table: table,
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
      const percentage = Number(total) * 0.15;
      reservation.depositAmount = baseAmount + percentage;
    } else {
      reservation.depositAmount = baseAmount + 5000;
    }

    await this.reservationsRepository.save(reservation);

    const fullReservation = await this.reservationsRepository.findOne({
      where: { id: reservation.id },
      relations: ['table', 'user', 'pedidos', 'pedidos.menuItem'],
    });

    if (!fullReservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const response: ReservationResponseDto = {
      id: fullReservation.id,
      reservationDate: fullReservation.reservationDate,
      startTime: fullReservation.startTime,
      peopleCount: fullReservation.peopleCount,
      totalPrice: Number(fullReservation.totalPrice),
      depositAmount: Number(fullReservation.depositAmount),
      status: fullReservation.status,
      notes: fullReservation.notes,

      user: {
        name: fullReservation.user.name,
        email: fullReservation.user.email,
      },

      table: {
        tableNumber: fullReservation.table.tableNumber,
      },

      pedidos: fullReservation.pedidos.map((pedido) => ({
        quantity: pedido.quantity,
        price: Number(pedido.price),
        name: pedido.menuItem.name,
      })),
    };

    return response;
  }

  findAll() {
    return this.reservationsRepository.find({
      relations: ['table', 'user', 'pedidos', 'pedidos.menuItem'],
    });
  }

  async findByUser(userId: string) {
    return this.reservationsRepository.find({
      where: { user: { id: userId } },
      relations: ['table', 'pedidos', 'pedidos.menuItem'],
    });
  }

  async cancel(reservationId: string, user: Users) {
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId },
      relations: ['pedidos', 'pedidos.menuItem'],
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

    return await this.reservationsRepository.save(reservation);
  }
}
