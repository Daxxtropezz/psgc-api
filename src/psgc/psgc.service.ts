import { Injectable, Logger } from '@nestjs/common';
import { PSGCItem, PSGCResponse } from '@interfaces/psgc.interface';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { PSGC_LEVELS } from '@constants/psgc.constants';
import { PSGCFilterDto } from './dto/psgc-filter.dto';

@Injectable()
export class PSCGService {
  private readonly logger = new Logger(PSCGService.name);
  private psgcData: PSGCItem[] = [];

  constructor() {
    this.loadAllData().catch((err) => {
      this.logger.error('Failed to load PSGC data', err.stack);
    });
  }

  private async loadAllData(): Promise<void> {
    try {
      await Promise.all([
        this.loadData('data/psgc_reg.csv', PSGC_LEVELS.REGION),
        this.loadData('data/psgc_prov.csv', PSGC_LEVELS.PROVINCE),
        this.loadData('data/psgc_mun.csv', PSGC_LEVELS.MUNICIPALITY),
        this.loadData('data/psgc_brgy.csv', PSGC_LEVELS.BARANGAY),
      ]);
      this.logger.log('All PSGC data loaded successfully');
    } catch (error) {
      this.logger.error('Error loading PSGC data', error.stack);
      throw error;
    }
  }

  private async loadData(filePath: string, level: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`File not found: ${filePath}`);
        return resolve();
      }

      const stream = fs
        .createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          this.psgcData.push(this.transformRow(row, level));
        })
        .on('end', () => {
          this.logger.log(`Loaded ${filePath} successfully`);
          resolve();
        })
        .on('error', (error) => {
          this.logger.error(`Error loading ${filePath}`, error);
          reject(error);
        });

      // Handle stream errors that might occur after piping
      stream.on('error', (error) => {
        this.logger.error(`Stream error for ${filePath}`, error);
        reject(error);
      });
    });
  }

  private transformRow(row: any, level: string): PSGCItem {
    return {
      code:
        row.code ||
        row.region_code ||
        row.province_code ||
        row.municipality_code ||
        row.barangay_code,
      name:
        row.name ||
        row.region_name ||
        row.province_name ||
        row.municipality_name ||
        row.barangay_name,
      level,
      parentCode:
        row.parent_code ||
        row.region_code ||
        row.province_code ||
        row.municipality_code ||
        undefined,
      // Add any additional fields from your CSV
      ...(row.income_class && { incomeClass: row.income_class }),
      ...(row.population && { population: parseInt(row.population) }),
    };
  }

  async findAll(filter?: PSGCFilterDto): Promise<PSGCResponse> {
    let filteredData = [...this.psgcData];

    if (filter?.level) {
      filteredData = filteredData.filter((item) => item.level === filter.level);
    }

    if (filter?.parentCode) {
      filteredData = filteredData.filter(
        (item) => item.parentCode === filter.parentCode,
      );
    }

    if (filter?.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(searchTerm),
      );
    }

    return {
      data: filteredData,
      total: filteredData.length,
    };
  }

  async findOne(code: string): Promise<PSGCItem | undefined> {
    return this.psgcData.find((item) => item.code === code);
  }

  async findByParent(parentCode: string): Promise<PSGCItem[]> {
    return this.psgcData.filter((item) => item.parentCode === parentCode);
  }

  async getLevels(): Promise<string[]> {
    return Object.values(PSGC_LEVELS);
  }

  async getHierarchy(code: string): Promise<PSGCItem[]> {
    const hierarchy: PSGCItem[] = [];
    let current = await this.findOne(code);

    while (current) {
      hierarchy.unshift(current);
      current = current.parentCode
        ? await this.findOne(current.parentCode)
        : undefined;
    }

    return hierarchy;
  }
}
