import {
  BadRequestException,
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

  async create(createReservationDto: CreateReservationDto) {
    const { pedidos, ...reservationData } = createReservationDto;
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

    const startTime = createReservationDto.startTime;

    if (startTime < '18:00' || startTime > '00:00') {
      throw new BadRequestException(
        'Las reservas solo se pueden hacer entre 18:00 y 23:00',
      );
    }

    const table = await this.tablesService.findAvailableTable();

    if (!table) {
      throw new NotFoundException('No hay mesas disponibles');
    }

    const reservation = this.reservationsRepository.create({
      ...reservationData,
      table: table,
      totalPrice: 0,
      depositAmount: 5000,
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

    if (total > 0) {
      reservation.depositAmount = total * 0.15;
    } else {
      reservation.depositAmount = 5000;
    }

    await this.reservationsRepository.save(reservation);

    const fullReservation = await this.reservationsRepository.findOne({
      where: { id: reservation.id },
      relations: ['table', 'pedidos', 'pedidos.menuItem'],
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
      relations: ['table', 'user', 'pedidos'],
    });
  }
}
