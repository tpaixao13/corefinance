import { BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { TipoLancamento } from '../extrato-lancamento.entity';
import { LancamentoParsed, ExtratoParseResult } from './ofx.parser';

/**
 * Parser XLSX/XLS.
 * Espera a primeira linha como cabeçalho com colunas: data, descricao, valor, tipo.
 */
export class XlsxParser {
  parse(buffer: Buffer): ExtratoParseResult {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const primeiraAba = workbook.Sheets[workbook.SheetNames[0]];

    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(primeiraAba, {
      defval: '',
      raw: false,
    });

    if (rows.length === 0) {
      throw new BadRequestException('Planilha XLSX está vazia');
    }

    const lancamentos: LancamentoParsed[] = [];
    const datas: Date[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const chaves = Object.keys(row).map((k) => k.toLowerCase());

      const data = this.extrairValor(row, chaves, ['data', 'date', 'dt']);
      const descricao = this.extrairValor(row, chaves, ['descricao', 'historico', 'memo', 'description']) as string || '';
      const valor = this.extrairValor(row, chaves, ['valor', 'value', 'amount']);
      const tipo = this.extrairValor(row, chaves, ['tipo', 'type', 'natureza']) as string;

      if (!data || !valor) continue;

      const dataObj = data instanceof Date ? data : new Date(String(data));
      const valorNum = parseFloat(String(valor).replace(',', '.'));

      if (isNaN(valorNum) || isNaN(dataObj.getTime())) continue;

      let tipoLancamento: TipoLancamento;
      const tipoUpper = String(tipo || '').toUpperCase();
      if (tipoUpper === 'CREDITO' || tipoUpper === 'C' || tipoUpper === 'CREDIT') {
        tipoLancamento = TipoLancamento.CREDITO;
      } else if (tipoUpper === 'DEBITO' || tipoUpper === 'D' || tipoUpper === 'DEBIT') {
        tipoLancamento = TipoLancamento.DEBITO;
      } else {
        tipoLancamento = valorNum >= 0 ? TipoLancamento.CREDITO : TipoLancamento.DEBITO;
      }

      datas.push(dataObj);
      lancamentos.push({
        idExterno: `xlsx-${i}-${Date.now()}`,
        data: dataObj,
        valor: Math.abs(valorNum),
        tipo: tipoLancamento,
        descricao,
      });
    }

    return {
      periodoInicio: datas.length ? new Date(Math.min(...datas.map((d) => d.getTime()))) : undefined,
      periodoFim: datas.length ? new Date(Math.max(...datas.map((d) => d.getTime()))) : undefined,
      lancamentos,
    };
  }

  private extrairValor(row: Record<string, unknown>, chaves: string[], alternativas: string[]): unknown {
    for (const alt of alternativas) {
      const chave = chaves.find((c) => c.includes(alt));
      if (chave) {
        const original = Object.keys(row).find((k) => k.toLowerCase() === chave);
        if (original) return row[original];
      }
    }
    return undefined;
  }
}
