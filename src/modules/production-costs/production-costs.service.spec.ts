import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StatusBiaya } from '@prisma/client';
import { ProductionCostsService } from './production-costs.service';

describe('ProductionCostsService (approval workflow)', () => {
  let service: ProductionCostsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      productionCost: {
        findUnique: jest.fn(),
        update: jest.fn().mockImplementation((args) => Promise.resolve(args.data)),
      },
    };
    service = new ProductionCostsService(prisma);
  });

  it('approve menyetel status APPROVED + approvedById', async () => {
    prisma.productionCost.findUnique.mockResolvedValue({ id: 'c1', status: StatusBiaya.PENDING });
    await service.approve('c1', { id: 'dir' } as any);
    expect(prisma.productionCost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'c1' },
        data: expect.objectContaining({ status: StatusBiaya.APPROVED, approvedById: 'dir' }),
      }),
    );
  });

  it('reject menyetel status REJECTED + rejectionNote', async () => {
    prisma.productionCost.findUnique.mockResolvedValue({ id: 'c1', status: StatusBiaya.PENDING });
    await service.reject('c1', { rejectionNote: 'over budget' } as any, { id: 'dir' } as any);
    expect(prisma.productionCost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: StatusBiaya.REJECTED, rejectionNote: 'over budget' }),
      }),
    );
  });

  it('update ditolak (400) bila biaya sudah APPROVED', async () => {
    prisma.productionCost.findUnique.mockResolvedValue({ id: 'c1', status: StatusBiaya.APPROVED });
    await expect(service.update('c1', {} as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('melempar 404 bila biaya tidak ditemukan', async () => {
    prisma.productionCost.findUnique.mockResolvedValue(null);
    await expect(service.approve('x', { id: 'dir' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });
});
