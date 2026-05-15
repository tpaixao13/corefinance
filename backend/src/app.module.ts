import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ContasBancariasModule } from './modules/contas-bancarias/contas-bancarias.module';
import { ExtratosModule } from './modules/extratos/extratos.module';
import { ConciliacaoModule } from './modules/conciliacao/conciliacao.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { ContasPagarModule } from './modules/contas-pagar/contas-pagar.module';
import { ContasReceberModule } from './modules/contas-receber/contas-receber.module';
import { EnderecosModule } from './modules/enderecos/enderecos.module';
import { RelatoriosModule } from './modules/relatorios/relatorios.module';
import { OrdensServicoModule } from './modules/ordens-servico/ordens-servico.module';
import { ClientesModule } from './modules/clientes/clientes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting global: 300 req/min por IP (padrão geral)
    // Login tem limite próprio mais restritivo via @Throttle no controller
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'tdgenfin'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        // synchronize NUNCA deve ser true em produção — destrói dados em alterações de schema
        synchronize: config.get('NODE_ENV') !== 'production' && config.get('NODE_ENV') !== 'prod',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    AuthModule,
    EmpresasModule,
    UsuariosModule,
    ContasBancariasModule,
    ExtratosModule,
    ConciliacaoModule,
    DashboardModule,
    AuditoriaModule,
    ContasPagarModule,
    ContasReceberModule,
    EnderecosModule,
    RelatoriosModule,
    OrdensServicoModule,
    ClientesModule,
  ],
})
export class AppModule {}
