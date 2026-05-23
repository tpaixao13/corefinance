import { IsString, IsNotEmpty, IsEmail, Matches, MaxLength, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nomeFantasia?: string;

  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX' })
  cnpj: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  inscricaoEstadual?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  inscricaoMunicipal?: string;

  // Endereço
  @IsOptional()
  @IsString()
  @MaxLength(10)
  cep?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  logradouro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  numero?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  complemento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bairro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cidade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  estado?: string;

  // Contato
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  site?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsuarios?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;
}
