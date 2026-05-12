import axios from 'axios';
import type { EnderecoCep } from '../types';

interface ViaCepResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean | string;
}

export const enderecosApi = {
  buscarCep: async (cep: string): Promise<EnderecoCep> => {
    const cepLimpo = cep.replace(/\D/g, '');
    const { data } = await axios.get<ViaCepResponse>(
      `https://viacep.com.br/ws/${cepLimpo}/json/`,
    );
    if (data.erro) throw new Error('CEP não encontrado');
    return {
      logradouro: data.logradouro ?? '',
      bairro: data.bairro ?? '',
      cidade: data.localidade ?? '',
      estado: data.uf ?? '',
    };
  },
};
