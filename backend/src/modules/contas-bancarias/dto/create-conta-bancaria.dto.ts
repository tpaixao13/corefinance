import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContaBancariaDto {
  @IsUUID()
  empresaId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  banco: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  agencia: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  numero: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descricao?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  saldoInicial?: number;
}
