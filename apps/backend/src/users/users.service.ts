import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GetUsersQueryDto } from "./dto/get-users.query.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async list(query: GetUsersQueryDto) {
    const where: Prisma.UserWhereInput = {};
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    if (query.search?.trim()) {
      where.name = { contains: query.search.trim(), mode: "insensitive" };
    }

    if (query.role) {
      where.role = query.role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async toggleActive(id: string) {
    const user = await this.getById(id);
    return this.prisma.user.update({
      where: { id },
      data: { active: !user.active }
    });
  }
}
