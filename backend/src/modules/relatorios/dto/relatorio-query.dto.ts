import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';

export class RelatorioQueryDto {
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @IsOptional()
  @IsUUID()
  empresaId?: string;
}

export class ExportarQueryDto extends RelatorioQueryDto {
  @IsOptional()
  @IsIn(['despesas', 'receitas', 'geral'])
  tipo?: 'despesas' | 'receitas' | 'geral';
}
