import { IsString, IsNotEmpty, Matches, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nome: string;

  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX' })
  cnpj: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
