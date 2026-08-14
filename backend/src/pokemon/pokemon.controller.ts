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
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) pokemonId: number,
  ) {
    return this.pokemonService.getPokemonForUser(
      userId,
      pokemonId,
    );
  }
}