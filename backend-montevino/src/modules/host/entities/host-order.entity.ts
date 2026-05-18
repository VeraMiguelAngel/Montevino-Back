import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Reservations } from 'src/modules/reservations/entities/reservation.entity';
import { Users } from 'src/modules/users/entities/user.entity';

export enum hostOrderStatus {
  EN_CURSO = 'EN_CURSO',
  FINALIZADA = 'FINALIZADA',
}

@Entity({ name: 'HOST_ORDERS' })
export class HostOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Reservations)
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservations;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'hostId' })
  host: Users;

  @CreateDateColumn()
  checkInTime: Date;

  @Column({
    type: 'enum',
    enum: hostOrderStatus,
    default: hostOrderStatus.EN_CURSO,
  })
  status: hostOrderStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
