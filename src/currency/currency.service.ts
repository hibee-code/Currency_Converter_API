import { Injectable, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
//import { Cache } from 'cache-manager';
import type { Cache } from 'cache-manager';
import { ConversionHistory } from './conversion-history.entity';
import { CurrencyGateway } from '../websocket/currency.gateway';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import axios from 'axios';
import * as cron from 'node-cron';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private exchangeRates: any = {};

  constructor(
    @InjectRepository(ConversionHistory)
    private conversionHistoryRepository: Repository<ConversionHistory>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private currencyGateway: CurrencyGateway,
    private httpService: HttpService,
    private configService: ConfigService,
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
      // Fetch latest exchange rates from API
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      this.exchangeRates = response.data.rates;
      
      // Safe cache operation with proper error handling
      try {
        // Cache for 5 minutes (300 seconds = 300000 milliseconds)
        await this.cacheManager.set('exchange_rates', this.exchangeRates, 300000);
        this.logger.debug('Exchange rates cached successfully');
      } catch (cacheError) {
        this.logger.warn('Failed to cache exchange rates', cacheError);
        // Continue execution even if caching fails
      }
      
      // Broadcast to WebSocket clients (with error handling)
      try {
        await this.currencyGateway.broadcastRateUpdate({
          timestamp: new Date(),
          rates: this.exchangeRates,
        });
        this.logger.debug('Rate update broadcasted to WebSocket clients');
      } catch (broadcastError) {
        this.logger.warn('Failed to broadcast rate update', broadcastError);
        // Continue execution even if broadcast fails
      }
      
      this.logger.log('Exchange rates updated successfully');
      
    } catch (error) {
      this.logger.error('Failed to update exchange rates from API', error);
      
      // Fallback strategy: Try to get cached rates first
      try {
        const cachedRates = await this.cacheManager.get('exchange_rates');
        if (cachedRates) {
          this.exchangeRates = cachedRates;
          this.logger.log('Using cached exchange rates as fallback');
        } else {
          // If no cached rates, use hardcoded fallback
          this.exchangeRates = this.getFallbackRates();
          this.logger.warn('Using hardcoded fallback exchange rates');
        }
      } catch (cacheError) {
        this.logger.warn('Failed to get cached rates', cacheError);
        // Final fallback to hardcoded rates
        this.exchangeRates = this.getFallbackRates();
        this.logger.warn('Using hardcoded fallback exchange rates after cache failure');
      }
      
      // Even with fallback rates, try to notify clients
      try {
        await this.currencyGateway.broadcastRateUpdate({
          timestamp: new Date(),
          rates: this.exchangeRates,
          isFallback: true, // Flag to indicate this is fallback data
        });
      } catch (broadcastError) {
        this.logger.error('Failed to broadcast fallback rates', broadcastError);
      }
    }
  }
  
  // Enhanced fallback rates method with metadata
  private getFallbackRates() {
    const fallbackRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
    };
    
    this.logger.warn('Using fallback exchange rates', { 
      ratesCount: Object.keys(fallbackRates).length,
      lastUpdated: new Date().toISOString()
    });
    
    return fallbackRates;
  }
  
  // Additional method for manual rate refresh with circuit breaker pattern
  private rateFetchAttempts = 0;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds
  
  async forceUpdateExchangeRates(): Promise<boolean> {
    if (this.rateFetchAttempts >= this.MAX_RETRY_ATTEMPTS) {
      this.logger.warn('Maximum retry attempts reached, skipping update');
      return false;
    }
  
    try {
      this.rateFetchAttempts++;
      await this.updateExchangeRates();
      this.rateFetchAttempts = 0; // Reset on success
      return true;
    } catch (error) {
      this.logger.error(`Rate update attempt ${this.rateFetchAttempts} failed`, error);
      
      if (this.rateFetchAttempts < this.MAX_RETRY_ATTEMPTS) {
        this.logger.log(`Retrying in ${this.RETRY_DELAY}ms...`);
        setTimeout(() => this.forceUpdateExchangeRates(), this.RETRY_DELAY);
      }
      return false;
    }
  }
  
  // Health check method for monitoring
  async getExchangeRatesHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastUpdate: Date;
    source: 'api' | 'cache' | 'fallback';
    ratesCount: number;
  }> {
    const ratesCount = Object.keys(this.exchangeRates).length;
    
    // Determine source and health status
    let source: 'api' | 'cache' | 'fallback' = 'fallback';
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';
    
    try {
      const cachedRates = await this.cacheManager.get('exchange_rates');
      if (cachedRates) {
        source = 'cache';
        status = 'degraded';
      }
      
      // If rates are fresh (less than 10 minutes old), consider it healthy
      // This would require storing timestamp with rates
      if (ratesCount > 5) {
        status = 'healthy';
        source = 'api';
      }
    } catch (error) {
      this.logger.warn('Health check cache access failed', error);
    }
    
    return {
      status,
      lastUpdate: new Date(),
      source,
      ratesCount,
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
        user: { id: userId },
      });
      await this.conversionHistoryRepository.save(history);
    }

    return result;
  }

  async getConversionHistory(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [history, total] = await this.conversionHistoryRepository.findAndCount({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
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

  async getRate(from: string, to: string): Promise<number> {
    const cacheKey = `${from}_${to}`;
    const cached = await this.cacheManager.get<number>(cacheKey);
    if (cached) return cached;

    const apiKey = this.configService.get('CURRENCY_API_KEY');
    const url = `${this.configService.get('CURRENCY_API_URL')}/convert?from=${from}&to=${to}&amount=1`;

    const response = await this.httpService.get(url, {
      headers: { apikey: apiKey },
    }).toPromise();
    if (!response) throw new Error('No response from currency API');
    const { data } = response;

    const rate = data.result;
    await this.cacheManager.set(cacheKey, rate, 300); // cache for 5 minutes
    return rate;
  }
} 