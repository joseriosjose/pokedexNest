import { Module } from '@nestjs/common';
import { AxiosAdapter } from './adapters/axios.adapter';
//CLI
//nest g mo common
@Module({
  providers: [AxiosAdapter],
  exports: [AxiosAdapter],
})
export class CommonModule {}
