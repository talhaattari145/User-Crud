
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserMapper } from './mappers/user.mapper.js';

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.database.user.create({
        data: createUserDto,
      });

      return UserMapper.toResponse(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async findAll() {
    const users = await this.database.user.findMany();

    return UserMapper.toResponseList(users);
  }

  async findOne(id: number) {
    const user = await this.database.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return UserMapper.toResponse(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    try {
      const user = await this.database.user.update({
        where: { id },
        data: updateUserDto,
      });

      return UserMapper.toResponse(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.database.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
