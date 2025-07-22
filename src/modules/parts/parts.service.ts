import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Part, PartDocument } from './entities/part.entity';
import { Service, ServiceDocument } from '../services/entities/service.entity';

@Injectable()
export class PartsService {
  constructor(
    @InjectModel(Part.name) private readonly partModel: Model<PartDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async create(dto: CreatePartDto) {
    let usedForService: Types.ObjectId = null;

    if (dto.usedForServiceId) {
      const service = await this.serviceModel.findById(dto.usedForServiceId);
      if (!service) throw new NotFoundException('Service not found');
      usedForService = new Types.ObjectId(String(service._id));
    }

    const created = new this.partModel({
      ...dto,
      usedForService,
    });

    return created.save();
  }

  async findAll() {
    return this.partModel
      .find()
      .sort({ purchaseDate: -1 })
      .populate('usedForService');
  }

  async findOne(id: string) {
    const part = await this.partModel
      .findById(id)
      .populate('usedForService')
      .exec();

    if (!part) throw new NotFoundException(`Part ${id} not found`);
    return part;
  }

  async update(id: string, dto: UpdatePartDto) {
    const updated = await this.partModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('usedForService');

    if (!updated) throw new NotFoundException(`Part ${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const result = await this.partModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Part ${id} not found`);
    return { message: `Part ${id} deleted successfully` };
  }
}
