import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ConciliacaoManualDto {
  @IsUUID()
  lancamentoExtratoId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;
}
