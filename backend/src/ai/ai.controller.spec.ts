import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AiController', () => {
  let controller: AiController;
  const aiService = {
    scanPokemonImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: aiService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes a supported image to the AI service', async () => {
    const image = {
      buffer: Buffer.from('image'),
      mimetype: 'image/png',
    };
    const result = {
      identified: true,
      pokemonName: 'pikachu',
      confidence: 0.97,
      pokemonId: 25,
      status: 'SCANNED' as const,
    };
    aiService.scanPokemonImage.mockResolvedValue(result);

    await expect(controller.scanImage(7, image)).resolves.toEqual(result);
    expect(aiService.scanPokemonImage).toHaveBeenCalledWith(7, image);
  });

  it('rejects a missing image', () => {
    expect(() => controller.scanImage(7)).toThrow(BadRequestException);
  });

  it('rejects an unsupported image type', () => {
    expect(() =>
      controller.scanImage(7, {
        buffer: Buffer.from('image'),
        mimetype: 'image/gif',
      }),
    ).toThrow(BadRequestException);
  });
});
