import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PokemonService } from './pokemon.service';
import { CurrentUserId } from '../auth/current-user-id.decorator';

@Controller('pokemon')
@UseGuards(AuthGuard)
export class PokemonController {
  constructor(
    private readonly pokemonService: PokemonService,
  ) {}

  @Get('wild-search')
  getWildSearch(
    @CurrentUserId() userId: number,
  ) {
    return this.pokemonService.getWildSearch(userId);
  }

  @Get(':id')
  getPokemonById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pokemonService.getPokemonById(id);
  }
}