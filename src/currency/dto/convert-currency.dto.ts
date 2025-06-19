import { IsString, IsNumber, IsNotEmpty, IsIn } from 'class-validator';

export class ConvertCurrencyDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'])
  fromCurrency: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'])
  toCurrency: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
} 