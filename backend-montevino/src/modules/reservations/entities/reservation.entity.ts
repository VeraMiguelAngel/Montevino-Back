import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { reservationStatus } from '../reservation-status.enum';
import { Users } from 'src/modules/users/entities/user.entity';
import { Pedidos } from 'src/modules/pedidos/entities/pedido.entity';
import { Table } from 'src/modules/tables/entities/table.entity';

@Entity({
  name: 'RESERVATIONS',
})
export class Reservations {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  reservationDate: string;

  @Column()
  startTime: string;

  @Column()
  peopleCount: number;

  @Column('decimal')
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  depositAmount: number;

  @Column({
    type: 'enum',
    enum: reservationStatus,
    default: reservationStatus.PAGO_PENDIENTE,
  })
  status: reservationStatus;

  @ManyToOne(() => Users, (user) => user.reservations)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => Table, (table) => table.reservations)
  @JoinColumn({ name: 'tableId' })
  table: Table | null;

  @OneToMany(() => Pedidos, (pedido) => pedido.reservation)
  pedidos: Pedidos[];

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
