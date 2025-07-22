import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, ClientDocument } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
  ) {}

  // Create a new client
  async create(dto: CreateClientDto): Promise<Client> {
    const created = new this.clientModel(dto);
    return created.save();
  }

  // Retrieve all clients, sorted by most recent
  async findAll(): Promise<Client[]> {
    return this.clientModel.find().sort({ createdAt: -1 }).exec();
  }

  // Retrieve a specific client
  async findOne(id: string): Promise<Client> {
    if (!isValidObjectId(id)) throw new NotFoundException('Invalid ID format');

    const client = await this.clientModel.findById(id).exec();
    if (!client) throw new NotFoundException(`Client with ID ${id} not found`);
    return client;
  }

  // Update client details
  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    if (!isValidObjectId(id)) throw new NotFoundException('Invalid ID format');

    const updated = await this.clientModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`Client with ID ${id} not found`);
    return updated;
  }

  // Delete a client
  async remove(id: string): Promise<{ message: string }> {
    if (!isValidObjectId(id)) throw new NotFoundException('Invalid ID format');

    const deleted = await this.clientModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Client with ID ${id} not found`);
    return { message: `Client ${id} deleted successfully` };
  }
}
