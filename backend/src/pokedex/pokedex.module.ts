import { Module } from '@nestjs/common';
import { PokedexController } from './pokedex.controller';
import { PokedexService } from './pokedex.service';
import { PokemonModule } from '../pokemon/pokemon.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PokemonModule, AuthModule],
  controllers: [PokedexController],
  providers: [PokedexService],
  exports: [PokedexService],
})
export class PokedexModule {}