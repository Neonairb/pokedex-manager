import { IsInt, IsPositive } from 'class-validator';

// For AI future implementation
export class ScanPokemonDto {
  @IsInt()
  @IsPositive()
  pokemonId!: number;
}