import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  Min,
  Max,
  Length,
  IsPositive,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { ExpenseDocument } from './entities/expense.entity';
import { ExpenseService } from './expenses.service';

// DTOs with validation decorators
export class CreateExpenseDto {
  @ApiProperty({ description: 'Expense category', example: 'Food' })
  @IsString()
  @Length(1, 50, { message: 'Category must be between 1 and 50 characters' })
  category: string;

  @ApiProperty({ description: 'Expense amount', example: 25.5 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must have at most 2 decimal places' },
  )
  @IsPositive({ message: 'Amount must be positive' })
  @Max(999999.99, { message: 'Amount cannot exceed 999,999.99' })
  amount: number;

  @ApiProperty({
    description: 'Expense description',
    example: 'Lunch at restaurant',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'Expense date',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  expenseDate?: Date;
}

export class UpdateExpenseDto {
  @ApiProperty({
    description: 'Expense category',
    example: 'Food',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Category must be between 1 and 50 characters' })
  category?: string;

  @ApiProperty({
    description: 'Expense amount',
    example: 25.5,
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must have at most 2 decimal places' },
  )
  @IsPositive({ message: 'Amount must be positive' })
  @Max(999999.99, { message: 'Amount cannot exceed 999,999.99' })
  amount?: number;

  @ApiProperty({
    description: 'Expense description',
    example: 'Lunch at restaurant',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'Expense date',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  expenseDate?: Date;
}

export class BulkCreateExpenseDto {
  @ApiProperty({
    description: 'Array of expenses to create',
    type: [CreateExpenseDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one expense is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseDto)
  expenses: CreateExpenseDto[];
}

export class BulkDeleteDto {
  @ApiProperty({
    description: 'Array of expense IDs to delete',
    example: ['60d5ec49f1b2c8b1f8e4e1a1'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ID is required' })
  @IsString({ each: true })
  ids: string[];
}

enum SortBy {
  AMOUNT = 'amount',
  EXPENSE_DATE = 'expenseDate',
  CATEGORY = 'category',
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ExpenseQueryDto {
  @ApiProperty({ description: 'Filter by category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Minimum amount filter', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiProperty({ description: 'Maximum amount filter', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiProperty({ description: 'Start date filter', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  startDate?: Date;

  @ApiProperty({ description: 'End date filter', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  endDate?: Date;

  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort field',
    enum: SortBy,
    default: SortBy.EXPENSE_DATE,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.EXPENSE_DATE;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

@ApiTags('Expenses')
@Controller('expenses')
@ApiBearerAuth() // Assuming you're using JWT authentication
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ExpenseController {
  private readonly logger = new Logger(ExpenseController.name);

  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Expense created successfully',
    type: 'ExpenseDocument',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
  ): Promise<ExpenseDocument> {
    this.logger.log(
      `Creating expense for category: ${createExpenseDto.category}`,
    );
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expenses retrieved successfully',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'minAmount',
    required: false,
    description: 'Minimum amount filter',
  })
  @ApiQuery({
    name: 'maxAmount',
    required: false,
    description: 'Maximum amount filter',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter (ISO string)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: SortBy,
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    description: 'Sort order',
  })
  async findAll(@Query() query: ExpenseQueryDto) {
    this.logger.log(
      `Retrieving expenses with filters: ${JSON.stringify(query)}`,
    );
    return this.expenseService.findAll(query);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get expense analytics and statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics retrieved successfully',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for analytics (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for analytics (ISO string)',
  })
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(
      `Retrieving analytics for period: ${startDate || 'all'} to ${endDate || 'all'}`,
    );
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.expenseService.getAnalytics(start, end);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all distinct expense categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully',
    type: [String],
  })
  async getCategories(): Promise<string[]> {
    this.logger.log('Retrieving all expense categories');
    return this.expenseService.getCategories();
  }

  @Get('total')
  @ApiOperation({ summary: 'Get total expenses for a period' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Total expenses calculated successfully',
    type: Number,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (ISO string)',
  })
  async getTotalExpenses(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ total: number }> {
    this.logger.log(
      `Calculating total expenses for period: ${startDate || 'all'} to ${endDate || 'all'}`,
    );
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const total = await this.expenseService.getTotalExpenses(start, end);
    return { total };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search expenses by description' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results retrieved successfully',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  async searchByDescription(
    @Query('q') searchTerm: string,
  ): Promise<ExpenseDocument[]> {
    this.logger.log(`Searching expenses with term: ${searchTerm}`);
    return this.expenseService.searchByDescription(searchTerm);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get expenses by category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expenses by category retrieved successfully',
  })
  @ApiParam({ name: 'category', description: 'Expense category' })
  async findByCategory(
    @Param('category') category: string,
  ): Promise<ExpenseDocument[]> {
    this.logger.log(`Retrieving expenses for category: ${category}`);
    return this.expenseService.findByCategory(category);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get expenses within date range' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expenses within date range retrieved successfully',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date (ISO string)',
  })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ExpenseDocument[]> {
    this.logger.log(`Retrieving expenses between ${startDate} and ${endDate}`);
    return this.expenseService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expense retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Expense not found',
  })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  async findById(@Param('id') id: string): Promise<ExpenseDocument> {
    this.logger.log(`Retrieving expense with ID: ${id}`);
    return this.expenseService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update expense by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expense updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Expense not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<ExpenseDocument> {
    this.logger.log(`Updating expense with ID: ${id}`);
    return this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Expense deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Expense not found',
  })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting expense with ID: ${id}`);
    await this.expenseService.delete(id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple expenses at once' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Expenses created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(
    @Body() bulkCreateDto: BulkCreateExpenseDto,
  ): Promise<ExpenseDocument[]> {
    this.logger.log(`Bulk creating ${bulkCreateDto.expenses.length} expenses`);
    return this.expenseService.bulkCreate(bulkCreateDto.expenses);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple expenses by IDs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expenses deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Promise<{ deletedCount: number }> {
    this.logger.log(`Bulk deleting ${bulkDeleteDto.ids.length} expenses`);
    return this.expenseService.bulkDelete(bulkDeleteDto.ids);
  }
}
