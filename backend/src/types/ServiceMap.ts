// import { Redis } from "ioredis";
// import Stripe from "stripe";

import { PrismaClient } from "@prisma/client";

export interface ServiceMap {
  prisma: PrismaClient;
  // redis: Redis;
  // stripe: Stripe;
}
