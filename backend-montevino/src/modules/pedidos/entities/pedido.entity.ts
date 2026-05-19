import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reservations } from '../../reservations/entities/reservation.entity';
import { Platos } from 'src/modules/platos/entities/platos.entity';

export enum pedidoStatus {
  PENDIENTE = 'PENDIENTE',
  ENTREGADO = 'ENTREGADO',
}

@Entity({ name: 'PEDIDOS' })
export class Pedidos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({
    type: 'enum',
    enum: pedidoStatus,
    default: pedidoStatus.PENDIENTE,
  })
  status: pedidoStatus;

  @Column({ default: false })
  isExtra: boolean;

  @ManyToOne(() => Platos)
  @JoinColumn({ name: 'platoId' })
  menuItem: Platos;

  @ManyToOne(() => Reservations, (reservation) => reservation.pedidos)
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservations;
}
