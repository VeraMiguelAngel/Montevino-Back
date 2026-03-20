import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ReservationsModule } from '../reservations/reservations.module';
import { TablesModule } from '../tables/tables.module';
import { MailModule } from '../notificaciones/mail.module';

@Module({
  imports: [ReservationsModule, TablesModule, MailModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
