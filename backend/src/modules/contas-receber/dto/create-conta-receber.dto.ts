import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { RecorrenciaContaPagar } from '../../contas-pagar/conta-pagar.entity';

export class CreateContaReceberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  descricao: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  cliente?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor: number;

  @IsDateString()
  dataRecebimento: string;

  @IsOptional()
  @IsEnum(RecorrenciaContaPagar)
  recorrencia?: RecorrenciaContaPagar;

  @IsOptional()
  @IsString()
  clienteId?: string;
}
