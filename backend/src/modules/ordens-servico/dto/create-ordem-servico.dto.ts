import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateOrdemServicoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  cliente: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  descricao: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor: number;

  @IsDateString()
  dataAbertura: string;
}
