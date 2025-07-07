import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PSCGService } from './psgc.service';
import { PSGCFilterDto } from './dto/psgc-filter.dto';
import { ApiKey } from '@decorators/api-key.decorator';
import { ApiKeyGuard } from '@guards/api-key.guard';
import { ApiHeader, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('PSGC')
@Controller('psgc')
@UseGuards(ApiKeyGuard)
export class PSGCController {
  constructor(private readonly psgcService: PSCGService) {}

  @Get()
  @ApiKey()
  @ApiHeader({ name: 'x-api-key' })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'parentCode', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'List of PSGC items' })
  async findAll(@Query() filter: PSGCFilterDto) {
    return this.psgcService.findAll(filter);
  }

  @Get('levels')
  @ApiResponse({ status: 200, description: 'List of PSGC levels' })
  async getLevels() {
    return this.psgcService.getLevels();
  }

  @Get(':code')
  @ApiKey()
  @ApiHeader({ name: 'x-api-key' })
  @ApiResponse({ status: 200, description: 'PSGC item details' })
  @ApiResponse({ status: 404, description: 'PSGC item not found' })
  async findOne(@Param('code') code: string) {
    const item = await this.psgcService.findOne(code);
    if (!item) {
      throw new NotFoundException('PSGC item not found');
    }
    return item;
  }
}
