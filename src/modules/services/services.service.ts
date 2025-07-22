import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Client } from '../clients/entities/client.entity';
import { Technician } from '../technicians/entities/technician.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(Technician.name)
    private readonly technicianModel: Model<Technician>,
  ) {}

  async create(dto: CreateServiceDto) {
    const serviceNumber = await this.generateServiceNumber();

    const client = await this.clientModel.findById(dto.clientId);
    if (!client) throw new NotFoundException('Client not found');

    let technician = null;
    if (dto.technicianId) {
      technician = await this.technicianModel.findById(dto.technicianId);
      if (!technician) throw new NotFoundException('Technician not found');
    }

    const newService = new this.serviceModel({
      ...dto,
      serviceNumber,
      client: client._id,
      assignedTechnician: technician?._id || undefined,
    });

    return newService.save();
  }

  async findAll() {
    return this.serviceModel
      .find()
      .sort({ createdAt: -1 })
      .populate(['client', 'assignedTechnician']);
  }

  async findOne(id: string) {
    const service = await this.serviceModel
      .findById(id)
      .populate(['client', 'assignedTechnician']);

    if (!service) throw new NotFoundException(`Service ${id} not found`);
    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    const updated = await this.serviceModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate(['client', 'assignedTechnician']);

    if (!updated) throw new NotFoundException(`Service ${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const result = await this.serviceModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Service ${id} not found`);
    return { message: `Service ${id} deleted successfully` };
  }

  async getTypes() {
    const types = await this.serviceModel.distinct('serviceType');

    const nnactServices = [
      'AC Repair & Servicing',
      'AC Installation & Relocation',
      'Refrigerator Repair & Gas Refill',
      'Freezer Repair',
      'Washing Machine Repair',
      'Dryer Repair',
      'Dishwasher Repair',
      'Microwave Repair',
      'Oven & Cooker Repair',
      'Water Heater Repair (Electric & Gas)',
      'Electric Iron Repair',
      'TV and Sound System Diagnostics',
      'Inverter AC Installation & Diagnostics',
      'Smart Home Appliance Configuration',
      'Multi-Zone Cooling Systems Setup',
      'Energy Efficiency Assessment',
      'Surge Protection Setup',
      'Heavy-duty Laundry Equipment Servicing',
      'Car AC Gas Refill (R134a / R1234yf)',
      'Car AC Compressor Repair / Replacement',
      'Evaporator & Condenser Cleaning',
      'HVAC Line Pressure Testing',
      'Cabin Air Filter Replacement',
      'Vehicle HVAC Diagnostic Scan',
      'Blower Motor & Relay Fault Repairs',
      'Leak Detection and Sealing',
      'Fleet HVAC Maintenance Plans',
      'Home Electrical Repairs',
      'Fan Installation & Servicing',
      'Generator Wiring & Repair',
      'Small Appliance Troubleshooting',
      'Preventive Maintenance Services',
      'Emergency Appliance Response',
      'AC Deep Cleaning & Mold Treatment',
      'Refrigerator Coil Cleaning',
      'Washing Machine Drum Descaling',
      'Kitchen Appliance Internal Degreasing',
      'Appliance Performance Optimization',
      'Compressor Supply & Installation',
      'AC Thermostat & Remote Replacement',
      'Fan Motors, Relays & Capacitor Replacements',
      'Refrigerator Seals & Door Gaskets',
      'Replacement of Heating Elements',
      'Genuine Spare Part Sales & Delivery',
      'Cold Room AC Installation',
      'Restaurant & Bakery Equipment Support',
      'Hospital Appliance Management Contracts',
      'Multi-site Appliance Contracts',
      'Mobile Appliance Repairs at Client Sites',
      'AC Planning for Building Projects',
    ];

    return types.length > 20 ? types : nnactServices;
  }

  private async generateServiceNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const monthLetters = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
    ];
    const monthLetter = monthLetters[now.getMonth()];
    const prefix = `NSN-${year}${monthLetter}`;

    // Find latest matching record
    const lastService = await this.serviceModel
      .findOne({ serviceNumber: new RegExp(`^${prefix}-\\d{4}$`) })
      .sort({ serviceNumber: -1 });

    let nextNumber = 1;
    if (lastService) {
      const parts = lastService.serviceNumber.split('-');
      const num = parseInt(parts[2]);
      if (!isNaN(num)) nextNumber = num + 1;
    }

    const sequential = nextNumber.toString().padStart(4, '0');
    return `${prefix}-${sequential}`;
  }
}
