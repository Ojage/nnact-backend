import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Client } from '../clients/entities/client.entity';
import { Project } from './entities/project.entity';
import { Technician } from '../technicians/entities/technician.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(Technician.name)
    private readonly technicianModel: Model<Technician>,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const projectData: any = {
      ...dto,
      client: dto.clientId
        ? Types.ObjectId.createFromHexString(String(dto.clientId))
        : null,
      leadTechnician: dto.leadTechnicianId
        ? Types.ObjectId.createFromHexString(String(dto.leadTechnicianId))
        : null,
    };

    if (dto.clientId) {
      const clientExists = await this.clientModel.exists({ _id: dto.clientId });
      if (!clientExists) throw new NotFoundException('Client not found');
    }

    if (dto.leadTechnicianId) {
      const techExists = await this.technicianModel.exists({
        _id: dto.leadTechnicianId,
      });
      if (!techExists) throw new NotFoundException('Technician not found');
    }

    const project = new this.projectModel(projectData);
    return project.save();
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel
      .find()
      .sort({ createdAt: -1 })
      .populate('client')
      .populate('leadTechnician')
      .populate('services');
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel
      .findById(id)
      .populate('client')
      .populate('leadTechnician')
      .populate('services');

    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const updated = await this.projectModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('client')
      .populate('leadTechnician')
      .populate('services');

    if (!updated) throw new NotFoundException(`Project ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.projectModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Project ${id} not found`);
    return { message: `Project ${id} deleted successfully` };
  }
}
