import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Req,
  UseGuards,
  Query,
  Body,
} from '@nestjs/common';
import { HostService } from './host.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { usersRole } from 'src/modules/users/users-role.enum';

@Controller('host')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(usersRole.HOST)
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @Get('reservations/today')
  getTodayReservations() {
    return this.hostService.getTodayReservations();
  }

  @Get('reservations')
  getReservationsByDate(@Query('date') date: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.hostService.getReservationsByDate(targetDate);
  }

  @Get('orders')
  getActiveOrders() {
    return this.hostService.getActiveOrders();
  }

  @Get('orders/closed')
  getClosedOrders() {
    return this.hostService.getClosedOrders();
  }

  @Get('reservations/pending')
  getPendingReservations() {
    return this.hostService.getPendingReservations();
  }

  @Post('reservations/:id/checkin')
  checkIn(@Param('id') id: string, @Req() req: any) {
    return this.hostService.checkIn(id, req.user.id);
  }

  @Get('orders/:id')
  getHostOrder(@Param('id') id: string) {
    return this.hostService.getHostOrder(id);
  }

  @Patch('pedidos/:id/deliver')
  deliverPedido(@Param('id') id: string) {
    return this.hostService.deliverPedido(id);
  }

  @Post('orders/:id/pedidos')
  addPedido(
    @Param('id') id: string,
    @Body() body: { platoId: string; quantity: number },
  ) {
    return this.hostService.addPedido(id, body.platoId, body.quantity);
  }

  @Patch('orders/:id/close')
  closeOrder(@Param('id') id: string) {
    return this.hostService.closeOrder(id);
  }

  @Patch('reservations/:id/cancel')
  cancelReservation(@Param('id') id: string) {
    return this.hostService.cancelReservation(id);
  }

  @Patch('orders/:id/activate')
  activarPedidos(@Param('id') id: string) {
    return this.hostService.activarPedidos(id);
  }
}
