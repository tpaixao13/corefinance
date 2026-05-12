import { IsOptional, IsString, IsEnum, IsDateString, IsNumber, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusContaReceber } from '../conta-receber.entity';
import { RecorrenciaContaPagar } from '../../contas-pagar/conta-pagar.entity';

export class UpdateContaReceberDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  descricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  cliente?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor?: number;

  @IsOptional()
  @IsDateString()
  dataRecebimento?: string;

  @IsOptional()
  @IsEnum(RecorrenciaContaPagar)
  recorrencia?: RecorrenciaContaPagar;

  @IsOptional()
  @IsEnum(StatusContaReceber)
  status?: StatusContaReceber;
}
