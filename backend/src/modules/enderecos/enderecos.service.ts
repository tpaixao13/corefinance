import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable()
export class EnderecosService {
  async buscarCep(cep: string) {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      throw new BadRequestException('CEP deve conter 8 dígitos');
    }

    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!res.ok) {
      throw new NotFoundException('CEP não encontrado');
    }

    const data: ViaCepResponse = await res.json();

    if (data.erro) {
      throw new NotFoundException('CEP não encontrado');
    }

    return {
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
    };
  }
}
