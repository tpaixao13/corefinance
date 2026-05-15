import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly repo: Repository<Cliente>,
  ) {}

  async criar(dto: CreateClienteDto, empresaId: string): Promise<Cliente> {
    const cliente = this.repo.create({ ...dto, empresaId });
    return this.repo.save(cliente);
  }

  async listar(empresaId: string, page = 1, limit = 50) {
    const [data, total] = await this.repo.findAndCount({
      where: { empresaId, ativo: true },
      order: { nome: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async buscar(empresaId: string, q: string): Promise<Cliente[]> {
    if (!q?.trim()) return [];
    return this.repo.find({
      where: [
        { empresaId, ativo: true, nome: ILike(`%${q}%`) },
        { empresaId, ativo: true, cpfCnpj: ILike(`%${q}%`) },
      ],
      order: { nome: 'ASC' },
      take: 10,
    });
  }

  async buscarPorId(id: string, empresaId: string): Promise<Cliente> {
    const c = await this.repo.findOne({ where: { id, empresaId } });
    if (!c) throw new NotFoundException('Cliente não encontrado');
    return c;
  }

  async atualizar(id: string, dto: UpdateClienteDto, empresaId: string): Promise<Cliente> {
    const c = await this.buscarPorId(id, empresaId);
    Object.assign(c, dto);
    return this.repo.save(c);
  }
}
