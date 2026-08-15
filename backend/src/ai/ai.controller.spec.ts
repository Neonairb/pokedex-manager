import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AiController', () => {
  let controller: AiController;
  const aiService = {
    scanPokemonImage: jest.fn(),
    getWildSearchAdvice: jest.fn(),
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

  it('passes a three-position wild encounter to the AI service', async () => {
    const encounter = [
      {
        pokemonId: 1,
        name: 'bulbasaur',
        sprite: 'bulbasaur.png',
        status: null,
        position: 'left' as const,
      },
      {
        pokemonId: 4,
        name: 'charmander',
        sprite: 'charmander.png',
        status: 'SEEN' as const,
        position: 'center' as const,
      },
      {
        pokemonId: 7,
        name: 'squirtle',
        sprite: 'squirtle.png',
        status: 'SCANNED' as const,
        position: 'right' as const,
      },
    ];
    const advice = 'Trainer, check the one on the left!';
    aiService.getWildSearchAdvice.mockResolvedValue(advice);

    await expect(controller.getWildSearchAdvice(7, encounter)).resolves.toBe(
      advice,
    );
    expect(aiService.getWildSearchAdvice).toHaveBeenCalledWith(7, encounter);
  });

  it('rejects an encounter without three unique positions', () => {
    const encounter = [
      { position: 'left' },
      { position: 'left' },
      { position: 'right' },
    ];

    expect(() =>
      controller.getWildSearchAdvice(
        7,
        encounter as Parameters<AiController['getWildSearchAdvice']>[1],
      ),
    ).toThrow(BadRequestException);
  });
});
