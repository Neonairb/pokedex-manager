import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { AiController } from './ai.controller';
import { AI_CLIENT, AiService } from './ai.service';
import { AuthModule } from '../auth/auth.module';
import { PokemonModule } from '../pokemon/pokemon.module';
import { PokedexModule } from '../pokedex/pokedex.module';

@Module({
  imports: [AuthModule, PokemonModule, PokedexModule],
  controllers: [AiController],
  providers: [
    {
      provide: AI_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new GoogleGenAI({
          apiKey: configService.getOrThrow<string>('AI_API_KEY'),
        }),
    },
    AiService,
  ],
})
export class AiModule {}
