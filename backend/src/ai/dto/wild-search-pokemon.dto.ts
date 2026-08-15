import { IsIn, IsInt, IsPositive, IsString, ValidateIf } from 'class-validator';
import type {
  WildSearchPokemon,
  WildSearchPosition,
} from '../../pokemon/interfaces/pokemon.interface';

export class WildSearchPokemonDto implements WildSearchPokemon {
  @IsInt()
  @IsPositive()
  pokemonId!: number;

  @IsString()
  name!: string;

  @ValidateIf((_, value: unknown) => value !== null)
  @IsString()
  sprite!: string | null;

  @ValidateIf((_, value: unknown) => value !== null)
  @IsIn(['SEEN', 'SCANNED'])
  status!: 'SEEN' | 'SCANNED' | null;

  @IsIn(['left', 'center', 'right'])
  position!: WildSearchPosition;
}
