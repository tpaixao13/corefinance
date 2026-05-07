import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('empresa')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  nome: string;

  @Column({ length: 18, unique: true })
  cnpj: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
