import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Client, ClientDocument } from '../clients/entities/client.entity';
import { Service, ServiceDocument } from '../services/entities/service.entity';
import { Feedback, FeedbackDocument } from './entities/feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly feedbackModel: Model<FeedbackDocument>,

    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,

    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async create(dto: CreateFeedbackDto) {
    const client = await this.clientModel.findById(dto.clientId);
    const service = await this.serviceModel.findById(dto.serviceId);

    if (!client || !service) {
      throw new NotFoundException('Client or Service not found');
    }

    const feedback = new this.feedbackModel({
      rating: dto.rating,
      comment: dto.comment,
      referral: dto.referral ?? false,
      client: dto.clientId,
      service: dto.serviceId,
    });

    return feedback.save();
  }

  findAll() {
    return this.feedbackModel
      .find()
      .populate('client')
      .populate('service')
      .sort({ feedbackDate: -1 })
      .exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Feedback ${id} not found`);
    }

    const feedback = await this.feedbackModel
      .findById(id)
      .populate('client')
      .populate('service')
      .exec();

    if (!feedback) throw new NotFoundException(`Feedback ${id} not found`);
    return feedback;
  }

  async update(id: string, dto: UpdateFeedbackDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Feedback ${id} not found`);
    }

    const feedback = await this.feedbackModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('client')
      .populate('service')
      .exec();

    if (!feedback) throw new NotFoundException(`Feedback ${id} not found`);
    return feedback;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Feedback ${id} not found`);
    }

    const feedback = await this.feedbackModel.findByIdAndDelete(id);
    if (!feedback) {
      throw new NotFoundException(`Feedback ${id} not found`);
    }
    return { message: `Feedback ${id} removed successfully` };
  }
}
