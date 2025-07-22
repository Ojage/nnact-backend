import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Create a new project.
   */
  @Post()
  async create(@Body() dto: CreateProjectDto) {
    const project = await this.projectsService.create(dto);
    return {
      message: 'Project created successfully',
      data: project,
    };
  }

  /**
   * Get all projects, sorted by newest.
   */
  @Get()
  async findAll() {
    const projects = await this.projectsService.findAll();
    return {
      count: projects.length,
      data: projects,
    };
  }

  /**
   * Get a single project by ID.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    return {
      data: project,
    };
  }

  /**
   * Update an existing project.
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const updated = await this.projectsService.update(id, dto);
    return {
      message: 'Project updated successfully',
      data: updated,
    };
  }

  /**
   * Delete a project.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.projectsService.remove(id);
    return;
  }
}
