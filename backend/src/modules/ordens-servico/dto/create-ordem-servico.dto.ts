import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDateString,
  IsEmail,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrdemServicoDto {
  @IsUUID()
  @IsNotEmpty()
  clienteId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  descricao: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor: number;

  @IsDateString()
  dataAbertura: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  emailCliente?: string;
}
