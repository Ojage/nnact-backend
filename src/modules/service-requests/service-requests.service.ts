import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ServiceRequest,
  ServiceRequestDocument,
} from './schemas/service-request.schema';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';

@Injectable()
export class ServiceRequestsService {
  constructor(
    @InjectModel(ServiceRequest.name)
    private serviceRequestModel: Model<ServiceRequestDocument>,
  ) {}

  async create(createDto: CreateServiceRequestDto): Promise<ServiceRequest> {
    const createdRequest = new this.serviceRequestModel(createDto);
    return createdRequest.save();
  }

  async findAll(): Promise<ServiceRequest[]> {
    return this.serviceRequestModel.find().exec();
  }

  async findOne(id: string): Promise<ServiceRequest> {
    return this.serviceRequestModel.findById(id).exec();
  }

  async update(
    id: string,
    updateDto: UpdateServiceRequestDto,
  ): Promise<ServiceRequest> {
    return this.serviceRequestModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<ServiceRequest> {
    return this.serviceRequestModel.findByIdAndDelete(id).exec();
  }

  async getAvailableSlots(date: string): Promise<string[]> {
    // Implement your slot availability logic here
    const slots = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
    ];
    return slots.filter(() => Math.random() > 0.3);
  }
}
