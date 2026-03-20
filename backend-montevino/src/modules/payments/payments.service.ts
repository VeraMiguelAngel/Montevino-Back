import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { ReservationsService } from '../reservations/reservations.service';
import { TablesService } from '../tables/tables.service';
import { reservationStatus } from '../reservations/reservation-status.enum';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly tablesService: TablesService,
  ) {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });
  }

  async createPreferenceByReservationId(reservationId: string) {
    const reservation = await this.reservationsService.findOne(reservationId);

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const preference = new Preference(this.client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: reservation.id,
            title: `Reserva #${reservation.id}`,
            quantity: 1,
            unit_price: Number(reservation.depositAmount),
          } as any,
        ],
        metadata: {
          reservationId: reservation.id,
        },
        external_reference: reservation.id,
        notification_url:
          'https://montevino-back-deploy.onrender.com/payments/webhook',
        back_urls: {
          success: 'http://localhost:3000/success',
          failure: 'http://localhost:3000/failure',
          pending: 'http://localhost:3000/pending',
        },
      },
    });

    return response.init_point;
  }

  async handleWebhook(body: any) {
    const paymentId =
      body?.data?.id ||
      (body?.type === 'payment' ? body?.id : null) ||
      (body?.topic === 'payment' ? body?.resource : null);

    if (!paymentId) {
      console.log('Webhook ignorado:', body);
      return;
    }

    const paymentApi = new Payment(this.client);
    const payment = await paymentApi.get({ id: String(paymentId) });

    const paymentStatus = payment?.status;

    const reservationId =
      payment?.metadata?.reservationId ||
      payment?.metadata?.reservation_id ||
      payment?.external_reference;

    if (!reservationId) {
      console.log('El pago no tiene reservationId ni external_reference');
      return;
    }

    if (paymentStatus !== 'approved') {
      console.log(`Pago ${paymentId} no aprobado. Estado: ${paymentStatus}`);
      return;
    }

    const reservation = await this.reservationsService.findOne(reservationId);

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.status === reservationStatus.CONFIRMADA) {
      return;
    }

    const reservationDate = new Date(reservation.reservationDate)
      .toISOString()
      .split('T')[0];

    const table = await this.tablesService.findAvailableTable(
      reservationDate,
      reservation.startTime,
    );

    if (!table) {
      throw new BadRequestException(
        'No hay mesas disponibles para ese horario',
      );
    }

    reservation.table = table;
    reservation.status = reservationStatus.CONFIRMADA;

    await this.reservationsService.save(reservation);

    console.log(
      `Reserva ${reservation.id} confirmada con mesa ${table.tableNumber}`,
    );
  }
}
