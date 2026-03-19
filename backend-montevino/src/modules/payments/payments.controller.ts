import { Controller, Post, Param, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    await this.paymentsService.handleWebhook(body);
    return { received: true };
  }

  @Post(':reservationId')
  async createPayment(@Param('reservationId') reservationId: string) {
    const url =
      await this.paymentsService.createPreferenceByReservationId(reservationId);
    return { url };
  }
}
