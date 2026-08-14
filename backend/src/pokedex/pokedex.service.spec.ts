import { Test, TestingModule } from '@nestjs/testing';
import { PokedexService } from './pokedex.service';

describe('PokedexService', () => {
  let service: PokedexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokedexService],
    }).compile();

    service = module.get<PokedexService>(PokedexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
