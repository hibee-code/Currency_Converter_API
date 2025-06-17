import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.alerts, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  fromCurrency: string;

  @Column()
  toCurrency: string;

  @Column('decimal')
  targetRate: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
} 