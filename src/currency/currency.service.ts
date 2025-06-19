import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConversionHistory } from './conversion-history.entity';
import { CurrencyGateway } from '../websocket/currency.gateway';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import axios from 'axios';
import * as cron from 'node-cron';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private exchangeRates: any = {};

  constructor(
    @InjectRepository(ConversionHistory)
    private conversionHistoryRepository: Repository<ConversionHistory>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private currencyGateway: CurrencyGateway,
  ) {
    this.initializeExchangeRates();
    this.scheduleRateUpdates();
  }

  private async initializeExchangeRates() {
    await this.updateExchangeRates();
  }

  private scheduleRateUpdates() {
    // Update rates every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.updateExchangeRates();
    });
  }

  private async updateExchangeRates() {
    try {
      // In production, use a real exchange rate API
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      this.exchangeRates = response.data.rates;
      
      // Cache the rates
      await this.cacheManager.set('exchange_rates', this.exchangeRates, 300); // 5 minutes
      
      // Broadcast to WebSocket clients
      await this.currencyGateway.broadcastRateUpdate({
        timestamp: new Date(),
        rates: this.exchangeRates,
      });
      
      this.logger.log('Exchange rates updated successfully');
    } catch (error) {
      this.logger.error('Failed to update exchange rates', error);
      // Fallback to cached rates
      this.exchangeRates = await this.cacheManager.get('exchange_rates') || this.getFallbackRates();
    }
  }

  private getFallbackRates() {
    return {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
    };
  }

  async convertCurrency(convertDto: ConvertCurrencyDto, userId?: number) {
    const { fromCurrency, toCurrency, amount } = convertDto;

    // Check cache first
    const cacheKey = `conversion_${fromCurrency}_${toCurrency}_${amount}`;
    const cachedResult = await this.cacheManager.get(cacheKey);
    
    if (cachedResult) {
      return cachedResult;
    }

    const rate = this.exchangeRates[toCurrency] / this.exchangeRates[fromCurrency];
    const convertedAmount = amount * rate;

    const result = {
      fromCurrency,
      toCurrency,
      originalAmount: amount,
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      exchangeRate: parseFloat(rate.toFixed(6)),
      timestamp: new Date(),
    };

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300);

    // Save conversion history if user is provided
    if (userId) {
      const history = this.conversionHistoryRepository.create({
        ...result,
        userId,
      });
      await this.conversionHistoryRepository.save(history);
    }

    return result;
  }

  async getConversionHistory(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [history, total] = await this.conversionHistoryRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSupportedCurrencies() {
    const cached = await this.cacheManager.get('supported_currencies');
    if (cached) return cached;

    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    ];

    await this.cacheManager.set('supported_currencies', currencies, 3600); // 1 hour
    return currencies;
  }

  async getExchangeRates(baseCurrency = 'USD') {
    return {
      base: baseCurrency,
      rates: this.exchangeRates,
      timestamp: new Date(),
    };
  }
} 