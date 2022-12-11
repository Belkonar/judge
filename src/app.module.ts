import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PolicyController } from './policy/policy.controller';
import { PolicyService } from './policy/policy.service';

@Module({
  imports: [],
  controllers: [AppController, PolicyController],
  providers: [AppService, PolicyService],
})
export class AppModule {}
