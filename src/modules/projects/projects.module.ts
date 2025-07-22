import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project, ProjectSchema } from './entities/project.entity';
import { Client, ClientSchema } from '../clients/entities/client.entity';
import {
  Technician,
  TechnicianSchema,
} from '../technicians/entities/technician.entity';
import { Service, ServiceSchema } from '../services/entities/service.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Technician.name, schema: TechnicianSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
