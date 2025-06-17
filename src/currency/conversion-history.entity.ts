import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class ConversionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user: User;

  @Column()
  fromCurrency: string;

  @Column()
  toCurrency: string;

  @Column('decimal')
  amount: number;

  @Column('decimal')
  result: number;

  @Column('decimal')
  rate: number;

  @CreateDateColumn()
  date: Date;
} 