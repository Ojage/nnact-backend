import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Client, ClientDocument } from '../clients/entities/client.entity';
import { Service, ServiceDocument } from '../services/entities/service.entity';
import { Payment, PaymentDocument } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,

    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,

    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async create(dto: CreatePaymentDto) {
    const client = await this.clientModel.findById(dto.clientId);
    const service = await this.serviceModel.findById(dto.serviceId);

    if (!client || !service) {
      throw new NotFoundException('Client or Service not found');
    }

    const payment = new this.paymentModel({
      ...dto,
      client: dto.clientId,
      service: dto.serviceId,
    });

    return payment.save();
  }

  findAll() {
    return this.paymentModel
      .find()
      .populate('client')
      .populate('service')
      .sort({ paidAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    const payment = await this.paymentModel
      .findById(id)
      .populate('client')
      .populate('service')
      .exec();

    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    const payment = await this.paymentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('client')
      .populate('service')
      .exec();

    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    const payment = await this.paymentModel.findByIdAndDelete(id);
    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }
    return { message: `Payment ${id} deleted successfully` };
  }
}
