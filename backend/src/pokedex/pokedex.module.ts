import { Module } from '@nestjs/common';
import { PokedexController } from './pokedex.controller';
import { PokedexService } from './pokedex.service';
import { PokemonModule } from '../pokemon/pokemon.module';

@Module({
  imports: [PokemonModule],
  controllers: [PokedexController],
  providers: [PokedexService],
  exports: [PokedexService],
})
export class PokedexModule {}