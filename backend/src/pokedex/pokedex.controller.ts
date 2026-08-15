import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { EncounterDto } from './dto/encounter.dto';
import { PokedexService } from './pokedex.service';

@Controller('pokedex')
@UseGuards(AuthGuard)
export class PokedexController {
  constructor(
    private readonly pokedexService: PokedexService,
  ) {}

  @Post('encounter')
  registerEncounter(
    @CurrentUserId() userId: number,
    @Body() dto: EncounterDto,
  ) {
    return this.pokedexService.registerEncounter(
      userId,
      dto,
    );
  }

  @Post('scan/:pokemonId')
  scanPokemon(
    @CurrentUserId() userId: number,
    @Param('pokemonId', ParseIntPipe) pokemonId: number,
  ) {
    return this.pokedexService.scanPokemon(
      userId,
      pokemonId,
    );
  }

  @Get('history')
  getHistory(
    @CurrentUserId() userId: number,
  ) {
    return this.pokedexService.getHistory(userId);
  }

  @Get('progress')
  getProgress(
    @CurrentUserId() userId: number,
  ) {
    return this.pokedexService.getProgress(userId);
  }

  @Get()
  getPokedex(
    @CurrentUserId() userId: number,
  ) {
    return this.pokedexService.getPokedex(userId);
  }
}
