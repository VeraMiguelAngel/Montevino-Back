import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Reservations } from './entities/reservation.entity';
import { reservationStatus } from './reservation-status.enum';

@Injectable()
export class ReservationsCron implements OnModuleInit {
  constructor(
    @InjectRepository(Reservations)
    private readonly reservationsRepo: Repository<Reservations>,
  ) {}

  onModuleInit() {
    // Ejecuta al arrancar y luego cada hora
    this.cancelExpiredReservations();
    setInterval(() => this.cancelExpiredReservations(), 60 * 60 * 1000);
  }

  async cancelExpiredReservations() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const expired = await this.reservationsRepo.find({
      where: {
        status: reservationStatus.PAGO_PENDIENTE,
        reservationDate: LessThan(yesterdayStr),
      },
    });

    for (const reservation of expired) {
      reservation.status = reservationStatus.CANCELADA;
      await this.reservationsRepo.save(reservation);
      console.log(`Reserva ${reservation.id} cancelada automáticamente`);
    }

    if (expired.length > 0) {
      console.log(`${expired.length} reservas canceladas automáticamente`);
    }
  }
}
