import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from '../empresas/empresa.entity';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_EMPRESA = 'ADMIN_EMPRESA',
  USUARIO = 'USUARIO',
}

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid', nullable: true })
  empresaId: string | null;

  @ManyToOne(() => Empresa, { nullable: true })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ length: 200 })
  nome: string;

  @Column({ length: 200, unique: true })
  email: string;

  @Column({ name: 'senha_hash', length: 255 })
  senhaHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.USUARIO })
  role: Role;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
