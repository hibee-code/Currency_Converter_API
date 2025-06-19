import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class FavoritePairDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'])
  fromCurrency: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'])
  toCurrency: string;
} 