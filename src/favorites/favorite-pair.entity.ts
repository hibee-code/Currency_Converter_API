import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class FavoritePair {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favoritePairs, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  fromCurrency: string;

  @Column()
  toCurrency: string;

  @CreateDateColumn()
  createdAt: Date;
} 