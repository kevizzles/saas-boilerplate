import { PrismaClient } from "@prisma/client";

const mockPrismaClient = {
  // Add mock methods as needed
};

const prisma = process.env.DATABASE_URL ? new PrismaClient() : mockPrismaClient;

export default prisma;
