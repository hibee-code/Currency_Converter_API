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
  UnauthorizedException,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CurrencyService } from './currency.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { Request as ExpressRequest } from 'express';
import axios from 'axios';

@Controller('currency')
@UseGuards(ThrottlerGuard)
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('convert')
  @HttpCode(HttpStatus.OK)
  async convertCurrency(
    @Body() convertDto: ConvertCurrencyDto,
    @Request() req: ExpressRequest,
  ) {
    const userId = req.user?.id;
    return this.currencyService.convertCurrency(convertDto, userId);
  }

  @Get('convert')
  async convertCurrencyGet(
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
    @Query('amount') amount: number,
    @Request() req: ExpressRequest,
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
    @Request() req: ExpressRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (!req.user) throw new UnauthorizedException();
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

  @Get('reverse')
  async reverse(@Query('from') from: string, @Query('to') to: string, @Query('amount') amount: number) {
    const rate = await this.currencyService.getRate(to, from);
    return { result: rate * Number(amount), rate };
  }

  @Get('historical')
  async historical(@Query('from') from: string, @Query('to') to: string, @Query('start') start: string, @Query('end') end: string) {
    // Use exchangerate.host for historical rates
    const url = `https://api.exchangerate.host/timeseries?start_date=${start}&end_date=${end}&base=${from}&symbols=${to}`;
    const { data } = await axios.get(url);
    return data;
  }
} 