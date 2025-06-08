import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CaslModule } from './casl/casl.module';

@Module({
  providers: [CommonService],
  exports: [CommonService],
  imports: [CaslModule],
})
export class CommonModule {}
