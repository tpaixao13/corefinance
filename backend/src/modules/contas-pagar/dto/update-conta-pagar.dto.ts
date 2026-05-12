import { IsOptional, IsString, IsEnum, IsDateString, IsNumber, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusContaPagar, RecorrenciaContaPagar } from '../conta-pagar.entity';

export class UpdateContaPagarDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  descricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fornecedor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor?: number;

  @IsOptional()
  @IsDateString()
  dataVencimento?: string;

  @IsOptional()
  @IsEnum(RecorrenciaContaPagar)
  recorrencia?: RecorrenciaContaPagar;

  @IsOptional()
  @IsEnum(StatusContaPagar)
  status?: StatusContaPagar;
}
