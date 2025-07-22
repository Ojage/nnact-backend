import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { Technician, TechnicianDocument } from './entities/technician.entity';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectModel(Technician.name)
    private readonly technicianModel: Model<TechnicianDocument>,
  ) {}

  async create(dto: CreateTechnicianDto) {
    const tech = new this.technicianModel(dto);
    return tech.save();
  }

  async findAll() {
    return this.technicianModel.find().sort({ dateJoined: -1 }).exec();
  }

  async findOne(id: string) {
    const tech = await this.technicianModel.findById(id).exec();
    if (!tech) throw new NotFoundException(`Technician ${id} not found`);
    return tech;
  }

  async update(id: string, dto: UpdateTechnicianDto) {
    const updated = await this.technicianModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Technician ${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const result = await this.technicianModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Technician ${id} not found`);
    return { message: `Technician ${id} removed successfully` };
  }
}
