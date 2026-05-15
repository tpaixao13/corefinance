import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class UpdateOrdemServicoDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  cliente?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor?: number;

  @IsOptional()
  @IsDateString()
  dataAbertura?: string;
}
