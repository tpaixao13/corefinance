import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EnderecosService } from './enderecos.service';

@Controller('enderecos')
@UseGuards(JwtAuthGuard)
export class EnderecosController {
  constructor(private readonly service: EnderecosService) {}

  @Get('cep/:cep')
  buscarCep(@Param('cep') cep: string) {
    return this.service.buscarCep(cep);
  }
}
