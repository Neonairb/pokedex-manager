import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
@UseGuards(AuthGuard)
export class PokemonController {
  constructor(
    private readonly pokemonService: PokemonService,
  ) {}

  @Get(':id')
  getPokemonById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pokemonService.getPokemonById(id);
  }
}