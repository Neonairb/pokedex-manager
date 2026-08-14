import { Test, TestingModule } from '@nestjs/testing';
import { PokedexController } from './pokedex.controller';

describe('PokedexController', () => {
  let controller: PokedexController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokedexController],
    }).compile();

    controller = module.get<PokedexController>(PokedexController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
