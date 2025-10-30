import { getUsageStatus } from '@/lib/usage';
import { protectedProcedure, createTRPCRouter } from '@/trpc/init';

export const usageRouter = createTRPCRouter({
  status: protectedProcedure.query(async () => {
    try {
      const usageStatus = await getUsageStatus();
      return usageStatus;
    } catch (error) {
      return null;
    }
  }),
});
