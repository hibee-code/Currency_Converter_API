import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { FavoritePair } from '../favorites/favorite-pair.entity';
import { Alert } from '../alerts/alert.entity';
import * as qrcode from 'qrcode';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'USD' })
  baseCurrency: string;

  @Column({ nullable: true, type: 'jsonb' })
  notificationSettings: any;

  @Column({ nullable: true })
  twoFactorSecret: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  is2FAEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => FavoritePair, (pair) => pair.user)
  favoritePairs: FavoritePair[];

  @OneToMany(() => Alert, (alert) => alert.user)
  alerts: Alert[];
} 