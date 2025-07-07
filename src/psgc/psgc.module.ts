import { Module } from '@nestjs/common';
import { PSCGService } from './psgc.service';
import { PSGCController } from './psgc.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PSGCController],
  providers: [PSCGService],
})
export class PSGCModule {}
