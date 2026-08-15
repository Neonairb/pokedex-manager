import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  ParseArrayPipe,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { AiService } from './ai.service';
import type { UploadedImage } from './interfaces/pokemon-identification.interface';
import { WildSearchPokemonDto } from './dto/wild-search-pokemon.dto';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('scan-image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  scanImage(
    @CurrentUserId() userId: number,
    @UploadedFile() image?: UploadedImage,
  ) {
    if (!image) {
      throw new BadRequestException('An image file is required');
    }

    if (!allowedImageTypes.has(image.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are supported',
      );
    }

    return this.aiService.scanPokemonImage(userId, image);
  }

  @Post('wild-search-advice')
  @HttpCode(HttpStatus.OK)
  getWildSearchAdvice(
    @CurrentUserId() userId: number,
    @Body(new ParseArrayPipe({ items: WildSearchPokemonDto }))
    encounter: WildSearchPokemonDto[],
  ) {
    if (encounter.length !== 3) {
      throw new BadRequestException(
        'A wild encounter must contain exactly three Pokémon',
      );
    }

    if (new Set(encounter.map((pokemon) => pokemon.position)).size !== 3) {
      throw new BadRequestException(
        'A wild encounter must contain left, center, and right positions',
      );
    }

    return this.aiService.getWildSearchAdvice(userId, encounter);
  }
}
