import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsPositive,
} from 'class-validator';

export class EncounterDto {
  @IsInt()
  @IsPositive()
  scannedPokemonId!: number;

  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  seenPokemonIds!: number[];
}