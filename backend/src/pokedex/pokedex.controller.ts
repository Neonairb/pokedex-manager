import {
  Body,
  Controller,
  Get,
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
}
