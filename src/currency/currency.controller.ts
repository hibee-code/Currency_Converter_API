import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CurrencyService } from './currency.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';

@Controller('currency')
@UseGuards(ThrottlerGuard)
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('convert')
  @HttpCode(HttpStatus.OK)
  async convertCurrency(
    @Body() convertDto: ConvertCurrencyDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.currencyService.convertCurrency(convertDto, userId);
  }

  @Get('convert')
  async convertCurrencyGet(
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
    @Query('amount') amount: number,
    @Request() req,
  ) {
    const convertDto = new ConvertCurrencyDto();
    convertDto.fromCurrency = fromCurrency;
    convertDto.toCurrency = toCurrency;
    convertDto.amount = amount;

    const userId = req.user?.id;
    return this.currencyService.convertCurrency(convertDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getConversionHistory(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.currencyService.getConversionHistory(req.user.id, page, limit);
  }

  @Get('currencies')
  async getSupportedCurrencies() {
    return this.currencyService.getSupportedCurrencies();
  }

  @Get('rates')
  async getExchangeRates(@Query('base') baseCurrency: string) {
    return this.currencyService.getExchangeRates(baseCurrency);
  }
} 