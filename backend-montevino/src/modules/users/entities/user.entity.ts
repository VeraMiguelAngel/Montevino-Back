import { Reservations } from 'src/modules/reservations/entities/reservation.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { usersRole } from '../users-role.enum';

@Entity({
  name: 'USERS',
})
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  auth0Id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: usersRole,
    default: usersRole.USER,
  })
  role: usersRole;

  @OneToMany(() => Reservations, (reservarion) => reservarion.user)
  reservations: Reservations[];
}
