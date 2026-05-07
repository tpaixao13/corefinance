import { BadRequestException } from '@nestjs/common';
import { TipoLancamento } from '../extrato-lancamento.entity';
import { LancamentoParsed, ExtratoParseResult } from './ofx.parser';

/**
 * Parser CSV genérico.
 * Espera colunas: data, descricao, valor, tipo (CREDITO|DEBITO)
 * O separador é detectado automaticamente (vírgula ou ponto-e-vírgula).
 */
export class CsvParser {
  parse(conteudo: string): ExtratoParseResult {
    const linhas = conteudo.split('\n').map((l) => l.trim()).filter(Boolean);

    if (linhas.length < 2) {
      throw new BadRequestException('CSV deve ter cabeçalho e ao menos uma linha de dados');
    }

    const separador = linhas[0].includes(';') ? ';' : ',';
    const cabecalho = linhas[0].split(separador).map((c) => c.trim().toLowerCase().replace(/"/g, ''));

    const idxData = this.encontrarColuna(cabecalho, ['data', 'date', 'dt']);
    const idxDescricao = this.encontrarColuna(cabecalho, ['descricao', 'descricão', 'historico', 'memo', 'description']);
    const idxValor = this.encontrarColuna(cabecalho, ['valor', 'value', 'amount', 'quantia']);
    const idxTipo = this.encontrarColuna(cabecalho, ['tipo', 'type', 'natureza']);

    if (idxData === -1 || idxValor === -1) {
      throw new BadRequestException('CSV deve conter colunas: data, valor');
    }

    const lancamentos: LancamentoParsed[] = [];
    const datas: Date[] = [];

    for (let i = 1; i < linhas.length; i++) {
      const colunas = linhas[i].split(separador).map((c) => c.trim().replace(/"/g, ''));

      const dataStr = colunas[idxData];
      const valorStr = colunas[idxValor];
      const descricao = idxDescricao !== -1 ? colunas[idxDescricao] : '';
      const tipoStr = idxTipo !== -1 ? colunas[idxTipo]?.toUpperCase() : '';

      const data = this.parseData(dataStr);
      const valorNum = parseFloat(valorStr.replace(',', '.'));

      if (isNaN(valorNum)) continue;

      let tipo: TipoLancamento;
      if (tipoStr === 'CREDITO' || tipoStr === 'C' || tipoStr === 'CREDIT') {
        tipo = TipoLancamento.CREDITO;
      } else if (tipoStr === 'DEBITO' || tipoStr === 'D' || tipoStr === 'DEBIT') {
        tipo = TipoLancamento.DEBITO;
      } else {
        tipo = valorNum >= 0 ? TipoLancamento.CREDITO : TipoLancamento.DEBITO;
      }

      datas.push(data);
      lancamentos.push({
        idExterno: `csv-${i}-${Date.now()}`,
        data,
        valor: Math.abs(valorNum),
        tipo,
        descricao,
      });
    }

    return {
      periodoInicio: datas.length ? new Date(Math.min(...datas.map((d) => d.getTime()))) : undefined,
      periodoFim: datas.length ? new Date(Math.max(...datas.map((d) => d.getTime()))) : undefined,
      lancamentos,
    };
  }

  private encontrarColuna(cabecalho: string[], alternativas: string[]): number {
    for (const alt of alternativas) {
      const idx = cabecalho.findIndex((c) => c.includes(alt));
      if (idx !== -1) return idx;
    }
    return -1;
  }

  private parseData(dataStr: string): Date {
    // Suporta DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
    const formatos = [
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
    ];

    for (const fmt of formatos) {
      const match = dataStr.match(fmt);
      if (match) {
        if (fmt.source.startsWith('^(\\d{4})')) {
          return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        }
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      }
    }

    throw new BadRequestException(`Formato de data não reconhecido: ${dataStr}`);
  }
}
