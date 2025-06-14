import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { HabitsModule } from './habits/habits.module';

@Module({
  imports: [CatsModule, HabitsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
