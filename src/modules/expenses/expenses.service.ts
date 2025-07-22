import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExpenseDocument, Expense } from './entities/expense.entity';

// DTOs for type safety and validation
export interface CreateExpenseDto {
  category: string;
  amount: number;
  description?: string;
  expenseDate?: Date;
}

export interface UpdateExpenseDto {
  category?: string;
  amount?: number;
  description?: string;
  expenseDate?: Date;
}

export interface ExpenseQueryDto {
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'amount' | 'expenseDate' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface ExpenseAnalytics {
  totalExpenses: number;
  averageExpense: number;
  categoryBreakdown: { category: string; total: number; count: number }[];
  monthlyTrends: { month: string; total: number; count: number }[];
  topExpenses: ExpenseDocument[];
}

export interface PaginatedExpenses {
  expenses: ExpenseDocument[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);

  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  /**
   * Create a new expense
   */
  async create(createExpenseDto: CreateExpenseDto): Promise<ExpenseDocument> {
    try {
      this.validateExpenseData(createExpenseDto);

      const expense = new this.expenseModel({
        ...createExpenseDto,
        expenseDate: createExpenseDto.expenseDate || new Date(),
      });

      const savedExpense = await expense.save();
      this.logger.log(`Expense created with ID: ${savedExpense._id}`);
      return savedExpense;
    } catch (error) {
      this.logger.error(`Error creating expense: ${error.message}`);
      throw new BadRequestException(
        `Failed to create expense: ${error.message}`,
      );
    }
  }

  /**
   * Find all expenses with optional filtering and pagination
   */
  async findAll(query: ExpenseQueryDto = {}): Promise<PaginatedExpenses> {
    try {
      const {
        category,
        minAmount,
        maxAmount,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = 'expenseDate',
        sortOrder = 'desc',
      } = query;

      // Build filter object
      const filter: any = {};

      if (category) {
        filter.category = { $regex: category, $options: 'i' };
      }

      if (minAmount !== undefined || maxAmount !== undefined) {
        filter.amount = {};
        if (minAmount !== undefined) filter.amount.$gte = minAmount;
        if (maxAmount !== undefined) filter.amount.$lte = maxAmount;
      }

      if (startDate || endDate) {
        filter.expenseDate = {};
        if (startDate) filter.expenseDate.$gte = new Date(startDate);
        if (endDate) filter.expenseDate.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      const [expenses, totalCount] = await Promise.all([
        this.expenseModel
          .find(filter)
          .sort({ [sortBy]: sortDirection })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.expenseModel.countDocuments(filter).exec(),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        expenses,
        totalCount,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };
    } catch (error) {
      this.logger.error(`Error finding expenses: ${error.message}`);
      throw new BadRequestException(
        `Failed to retrieve expenses: ${error.message}`,
      );
    }
  }

  /**
   * Find expense by ID
   */
  async findById(id: string): Promise<ExpenseDocument> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid expense ID format');
      }

      const expense = await this.expenseModel.findById(id).exec();
      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }

      return expense;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error finding expense by ID: ${error.message}`);
      throw new BadRequestException(
        `Failed to retrieve expense: ${error.message}`,
      );
    }
  }

  /**
   * Update expense by ID
   */
  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<ExpenseDocument> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid expense ID format');
      }

      this.validateExpenseData(updateExpenseDto);

      const expense = await this.expenseModel
        .findByIdAndUpdate(id, updateExpenseDto, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }

      this.logger.log(`Expense updated with ID: ${id}`);
      return expense;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error updating expense: ${error.message}`);
      throw new BadRequestException(
        `Failed to update expense: ${error.message}`,
      );
    }
  }

  /**
   * Delete expense by ID
   */
  async delete(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid expense ID format');
      }

      const result = await this.expenseModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }

      this.logger.log(`Expense deleted with ID: ${id}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error deleting expense: ${error.message}`);
      throw new BadRequestException(
        `Failed to delete expense: ${error.message}`,
      );
    }
  }

  /**
   * Get expenses by category
   */
  async findByCategory(category: string): Promise<ExpenseDocument[]> {
    try {
      return await this.expenseModel
        .find({ category: { $regex: category, $options: 'i' } })
        .sort({ expenseDate: -1 })
        .exec();
    } catch (error) {
      this.logger.error(`Error finding expenses by category: ${error.message}`);
      throw new BadRequestException(
        `Failed to retrieve expenses by category: ${error.message}`,
      );
    }
  }

  /**
   * Get expenses within date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<ExpenseDocument[]> {
    try {
      return await this.expenseModel
        .find({
          expenseDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        })
        .sort({ expenseDate: -1 })
        .exec();
    } catch (error) {
      this.logger.error(
        `Error finding expenses by date range: ${error.message}`,
      );
      throw new BadRequestException(
        `Failed to retrieve expenses by date range: ${error.message}`,
      );
    }
  }

  /**
   * Get total expenses for a specific period
   */
  async getTotalExpenses(startDate?: Date, endDate?: Date): Promise<number> {
    try {
      const filter: any = {};
      if (startDate || endDate) {
        filter.expenseDate = {};
        if (startDate) filter.expenseDate.$gte = new Date(startDate);
        if (endDate) filter.expenseDate.$lte = new Date(endDate);
      }

      const result = await this.expenseModel.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      this.logger.error(`Error calculating total expenses: ${error.message}`);
      throw new BadRequestException(
        `Failed to calculate total expenses: ${error.message}`,
      );
    }
  }

  /**
   * Get comprehensive expense analytics
   */
  async getAnalytics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<ExpenseAnalytics> {
    try {
      const filter: any = {};
      if (startDate || endDate) {
        filter.expenseDate = {};
        if (startDate) filter.expenseDate.$gte = new Date(startDate);
        if (endDate) filter.expenseDate.$lte = new Date(endDate);
      }

      const [totalStats, categoryBreakdown, monthlyTrends, topExpenses] =
        await Promise.all([
          this.expenseModel.aggregate([
            { $match: filter },
            {
              $group: {
                _id: null,
                totalExpenses: { $sum: '$amount' },
                averageExpense: { $avg: '$amount' },
                count: { $sum: 1 },
              },
            },
          ]),
          this.expenseModel.aggregate([
            { $match: filter },
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
          ]),
          this.expenseModel.aggregate([
            { $match: filter },
            {
              $group: {
                _id: {
                  year: { $year: '$expenseDate' },
                  month: { $month: '$expenseDate' },
                },
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
          ]),
          this.expenseModel.find(filter).sort({ amount: -1 }).limit(10).exec(),
        ]);

      return {
        totalExpenses: totalStats[0]?.totalExpenses || 0,
        averageExpense:
          Math.round((totalStats[0]?.averageExpense || 0) * 100) / 100,
        categoryBreakdown: categoryBreakdown.map((item) => ({
          category: item._id,
          total: Math.round(item.total * 100) / 100,
          count: item.count,
        })),
        monthlyTrends: monthlyTrends.map((item) => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          total: Math.round(item.total * 100) / 100,
          count: item.count,
        })),
        topExpenses,
      };
    } catch (error) {
      this.logger.error(`Error generating analytics: ${error.message}`);
      throw new BadRequestException(
        `Failed to generate analytics: ${error.message}`,
      );
    }
  }

  /**
   * Bulk create expenses
   */
  async bulkCreate(expenses: CreateExpenseDto[]): Promise<ExpenseDocument[]> {
    try {
      expenses.forEach((expense) => this.validateExpenseData(expense));

      const expensesToCreate = expenses.map((expense) => ({
        ...expense,
        expenseDate: expense.expenseDate || new Date(),
      }));

      const createdExpenses =
        await this.expenseModel.insertMany(expensesToCreate);
      this.logger.log(`Bulk created ${createdExpenses.length} expenses`);
      return createdExpenses as ExpenseDocument[];
    } catch (error) {
      this.logger.error(`Error bulk creating expenses: ${error.message}`);
      throw new BadRequestException(
        `Failed to bulk create expenses: ${error.message}`,
      );
    }
  }

  /**
   * Bulk delete expenses by IDs
   */
  async bulkDelete(ids: string[]): Promise<{ deletedCount: number }> {
    try {
      const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
      if (validIds.length !== ids.length) {
        throw new BadRequestException('Some expense IDs are invalid');
      }

      const result = await this.expenseModel.deleteMany({
        _id: { $in: validIds },
      });
      this.logger.log(`Bulk deleted ${result.deletedCount} expenses`);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      this.logger.error(`Error bulk deleting expenses: ${error.message}`);
      throw new BadRequestException(
        `Failed to bulk delete expenses: ${error.message}`,
      );
    }
  }

  /**
   * Get distinct categories
   */
  async getCategories(): Promise<string[]> {
    try {
      return await this.expenseModel.distinct('category').exec();
    } catch (error) {
      this.logger.error(`Error getting categories: ${error.message}`);
      throw new BadRequestException(
        `Failed to retrieve categories: ${error.message}`,
      );
    }
  }

  /**
   * Search expenses by description
   */
  async searchByDescription(searchTerm: string): Promise<ExpenseDocument[]> {
    try {
      return await this.expenseModel
        .find({
          description: { $regex: searchTerm, $options: 'i' },
        })
        .sort({ expenseDate: -1 })
        .exec();
    } catch (error) {
      this.logger.error(`Error searching expenses: ${error.message}`);
      throw new BadRequestException(
        `Failed to search expenses: ${error.message}`,
      );
    }
  }

  /**
   * Private method to validate expense data
   */
  private validateExpenseData(
    expenseData: CreateExpenseDto | UpdateExpenseDto,
  ): void {
    if (expenseData.amount !== undefined) {
      if (expenseData.amount < 0) {
        throw new BadRequestException('Amount cannot be negative');
      }
      if (expenseData.amount > 999999.99) {
        throw new BadRequestException('Amount cannot exceed 999,999.99');
      }
    }

    if (expenseData.category !== undefined) {
      if (!expenseData.category.trim()) {
        throw new BadRequestException('Category cannot be empty');
      }
      if (expenseData.category.length > 50) {
        throw new BadRequestException('Category cannot exceed 50 characters');
      }
    }

    if (
      expenseData.description !== undefined &&
      expenseData.description.length > 500
    ) {
      throw new BadRequestException('Description cannot exceed 500 characters');
    }

    if (expenseData.expenseDate !== undefined) {
      const expenseDate = new Date(expenseData.expenseDate);
      if (isNaN(expenseDate.getTime())) {
        throw new BadRequestException('Invalid expense date format');
      }
      if (expenseDate > new Date()) {
        throw new BadRequestException('Expense date cannot be in the future');
      }
    }
  }
}
