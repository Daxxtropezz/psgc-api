import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PSGCModule } from './psgc/psgc.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PSGCModule,
  ],
})
export class AppModule {}
