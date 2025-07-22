import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Create a new service record
   */
  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  /**
   * Get all services, sorted by creation date
   */
  @Get()
  async findAll() {
    return this.servicesService.findAll();
  }

  /**
   * Get list of distinct service types from DB
   */
  @Get('types')
  async getTypes() {
    return this.servicesService.getTypes();
  }

  /**
   * Find one service by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  /**
   * Update a service by ID
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, updateServiceDto);
  }

  /**
   * Delete a service by ID
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
