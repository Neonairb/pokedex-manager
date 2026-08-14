import { Module } from '@nestjs/common';
import { PokedexController } from './pokedex.controller';
import { PokedexService } from './pokedex.service';

@Module({
  controllers: [PokedexController],
  providers: [PokedexService]
})
export class PokedexModule {}
