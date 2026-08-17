import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { publicUserSelect, PublicUser, UserWithPasswordHash } from "../lib/publicUser";

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`email already in use: ${email}`);
  }
}

const userWithPasswordSelect = {
  ...publicUserSelect,
  passwordHash: true,
} as const;

export const userRepository = {
  findByEmail(email: string): Promise<UserWithPasswordHash | null> {
    return prisma.user.findUnique({ where: { email }, select: userWithPasswordSelect });
  },

  findPublicById(id: string): Promise<PublicUser | null> {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  },

  async createUser(data: { name: string; email: string; passwordHash: string }): Promise<PublicUser> {
    try {
      return await prisma.user.create({ data, select: publicUserSelect });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new DuplicateEmailError(data.email);
      }
      throw err;
    }
  },
};
