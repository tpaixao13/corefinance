import { BadRequestException } from '@nestjs/common';
import { TipoLancamento } from '../extrato-lancamento.entity';

export interface LancamentoParsed {
  idExterno: string;
  data: Date;
  valor: number;
  tipo: TipoLancamento;
  descricao: string;
  saldoExtrato?: number;
}

export interface ExtratoParseResult {
  periodoInicio?: Date;
  periodoFim?: Date;
  lancamentos: LancamentoParsed[];
}

/**
 * Parser OFX (Open Financial Exchange).
 * OFX é um formato SGML — não XML puro, por isso fazemos parsing via regex.
 * Suporta tanto OFX 1.x (SGML) quanto OFX 2.x (XML).
 */
export class OfxParser {
  parse(conteudo: string): ExtratoParseResult {
    const isXml = conteudo.trim().startsWith('<?xml') || conteudo.includes('<OFX>');

    if (isXml) {
      return this.parseXml(conteudo);
    }

    return this.parseSgml(conteudo);
  }

  private extrairTag(conteudo: string, tag: string): string | undefined {
    const regex = new RegExp(`<${tag}>([^<]+)`, 'i');
    const match = conteudo.match(regex);
    return match?.[1]?.trim();
  }

  private parseSgml(conteudo: string): ExtratoParseResult {
    // Encontra todos os blocos de transação
    const transacaoRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    const lancamentos: LancamentoParsed[] = [];

    let match: RegExpExecArray | null;
    while ((match = transacaoRegex.exec(conteudo)) !== null) {
      const bloco = match[1];
      const lancamento = this.parsearBlocoTransacao(bloco);
      if (lancamento) lancamentos.push(lancamento);
    }

    // Extrai período
    const dtStart = this.extrairTag(conteudo, 'DTSTART');
    const dtEnd = this.extrairTag(conteudo, 'DTEND');

    return {
      periodoInicio: dtStart ? this.parseOfxDate(dtStart) : undefined,
      periodoFim: dtEnd ? this.parseOfxDate(dtEnd) : undefined,
      lancamentos,
    };
  }

  private parseXml(conteudo: string): ExtratoParseResult {
    // Para OFX 2.x (XML válido), reutilizamos o mesmo regex approach
    return this.parseSgml(conteudo);
  }

  private parsearBlocoTransacao(bloco: string): LancamentoParsed | null {
    const trntype = this.extrairTag(bloco, 'TRNTYPE');
    const dtposted = this.extrairTag(bloco, 'DTPOSTED');
    const trnamt = this.extrairTag(bloco, 'TRNAMT');
    const fitid = this.extrairTag(bloco, 'FITID');
    const memo = this.extrairTag(bloco, 'MEMO') || this.extrairTag(bloco, 'NAME') || '';

    if (!dtposted || !trnamt || !fitid) return null;

    const valorNumerico = parseFloat(trnamt.replace(',', '.'));
    if (isNaN(valorNumerico)) return null;

    // No OFX, crédito = valor positivo; débito = valor negativo
    const tipo = valorNumerico >= 0 ? TipoLancamento.CREDITO : TipoLancamento.DEBITO;
    const valor = Math.abs(valorNumerico);

    return {
      idExterno: fitid,
      data: this.parseOfxDate(dtposted),
      valor,
      tipo,
      descricao: memo,
    };
  }

  private parseOfxDate(dateStr: string): Date {
    // Formato OFX: YYYYMMDDHHMMSS[.xxx][+/-TZ]
    const limpo = dateStr.substring(0, 8);
    if (limpo.length !== 8) {
      throw new BadRequestException(`Data OFX inválida: ${dateStr}`);
    }

    const ano = parseInt(limpo.substring(0, 4));
    const mes = parseInt(limpo.substring(4, 6)) - 1;
    const dia = parseInt(limpo.substring(6, 8));

    return new Date(ano, mes, dia);
  }
}
