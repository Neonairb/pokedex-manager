import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PokemonService } from '../pokemon/pokemon.service';
import { PokedexService } from './pokedex.service';

describe('PokedexService', () => {
  let service: PokedexService;
  const prisma = {
    userPokemon: {
      findMany: jest.fn(),
    },
  };
  const pokemonService = {
    getPokemonTypes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokedexService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: PokemonService,
          useValue: pokemonService,
        },
      ],
    }).compile();

    service = module.get<PokedexService>(PokedexService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('summarizes scanned Pokémon by type', async () => {
    prisma.userPokemon.findMany.mockResolvedValue([
      { pokemonId: 6 },
      { pokemonId: 130 },
      { pokemonId: 25 },
    ]);
    pokemonService.getPokemonTypes
      .mockResolvedValueOnce(['fire', 'flying'])
      .mockResolvedValueOnce(['water', 'flying'])
      .mockResolvedValueOnce(['electric']);

    const progress = await service.getProgress(7);

    expect(prisma.userPokemon.findMany).toHaveBeenCalledWith({
      where: {
        userId: 7,
        status: 'SCANNED',
      },
      select: {
        pokemonId: true,
      },
    });
    expect(progress.totalScanned).toBe(3);
    expect(progress.byType).toContainEqual({ type: 'fire', count: 1 });
    expect(progress.byType).toContainEqual({ type: 'flying', count: 2 });
    expect(progress.byType).toContainEqual({ type: 'water', count: 1 });
    expect(progress.byType).toContainEqual({ type: 'electric', count: 1 });
    expect(progress.byType).toContainEqual({ type: 'fairy', count: 0 });
  });
});
