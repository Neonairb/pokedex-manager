import { Test, TestingModule } from '@nestjs/testing';
import { PokedexController } from './pokedex.controller';
import { PokedexService } from './pokedex.service';

describe('PokedexController', () => {
  let controller: PokedexController;
  const pokedexService = {
    getProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokedexController],
      providers: [
        {
          provide: PokedexService,
          useValue: pokedexService,
        },
      ],
    }).compile();

    controller = module.get<PokedexController>(PokedexController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns the authenticated trainer progress', () => {
    const progress = {
      totalScanned: 1,
      byType: [{ type: 'electric', count: 1 }],
    };
    pokedexService.getProgress.mockReturnValue(progress);

    expect(controller.getProgress(7)).toBe(progress);
    expect(pokedexService.getProgress).toHaveBeenCalledWith(7);
  });
});
