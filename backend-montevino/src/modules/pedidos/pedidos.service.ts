import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedidos } from './entities/pedido.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedidos)
    private pedidosRepository: Repository<Pedidos>,
  ) {}

  findAll() {
    return this.pedidosRepository.find();
  }

  findOne(id: number) {
    return this.pedidosRepository.findOneBy({ id });
  }

  create(data: Partial<Pedidos>) {
    const nuevoPedido = this.pedidosRepository.create(data);
    return this.pedidosRepository.save(nuevoPedido);
  }

  async update(id: number, data: Partial<Pedidos>) {
    await this.pedidosRepository.update(id, data);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.pedidosRepository.delete(id);
  }
}
