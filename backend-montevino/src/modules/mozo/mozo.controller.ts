import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MozoService } from './mozo.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { usersRole } from 'src/modules/users/users-role.enum';

@Controller('mozo')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(usersRole.MOZO)
export class MozoController {
  constructor(private readonly mozoService: MozoService) {}

  @Get('orders')
  getActiveOrders() {
    return this.mozoService.getActiveOrders();
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.mozoService.getOrder(id);
  }

  @Patch('pedidos/:id/deliver')
  deliverPedido(@Param('id') id: string) {
    return this.mozoService.deliverPedido(id);
  }

  @Post('orders/:id/pedidos')
  addPedido(
    @Param('id') id: string,
    @Body() body: { platoId: string; quantity: number },
  ) {
    return this.mozoService.addPedido(id, body.platoId, body.quantity);
  }

  @Patch('orders/:id/close')
  closeOrder(@Param('id') id: string) {
    return this.mozoService.closeOrder(id);
  }
}
