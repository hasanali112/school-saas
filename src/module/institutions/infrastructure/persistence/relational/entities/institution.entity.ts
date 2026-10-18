import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('institutions')
export class InstitutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ type: 'text' })
  nameBn: string;

  @Column({ type: 'text' })
  nameEn: string;

  @Column({ type: 'text', unique: true, nullable: true })
  eiin: string | null;

  @Column({ type: 'text', nullable: true })
  addressBn: string | null;

  @Column({ type: 'text', nullable: true })
  addressEn: string | null;

  @Column({ type: 'text', nullable: true })
  phone: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
