import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    await this.paymentsService.handleWebhook(body);
    return { received: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':reservationId')
  async createPayment(@Param('reservationId') reservationId: string) {
    const url =
      await this.paymentsService.createPreferenceByReservationId(reservationId);
    return { url };
  }
}
