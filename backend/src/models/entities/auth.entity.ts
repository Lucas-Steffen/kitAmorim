import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Users } from './users.entity';
import { BaseEntity } from './base.entity';

@Entity('auth_codes')
export class AuthEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 6 })
  code: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ManyToOne(() => Users, (user) => user.authCodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;
}