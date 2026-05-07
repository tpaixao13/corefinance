import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsOptional()
  @IsUUID()
  empresaId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsEnum(Role)
  role: Role;
}
