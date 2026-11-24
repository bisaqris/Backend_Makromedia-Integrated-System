import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertCompanyClientDto } from './dto/company-client.dto';

@Injectable()
export class CompanyClientsService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.companyClient.findMany({
      where: { deletedAt: null },
      include: { clients: { where: { deletedAt: null } } },
      orderBy: { name: 'asc' },
    });
  }
  create(dto: UpsertCompanyClientDto) { return this.prisma.companyClient.create({ data: dto }); }
  async update(id: string, dto: UpsertCompanyClientDto) {
    await this.ensure(id);
    return this.prisma.companyClient.update({ where: { id }, data: dto });
  }
  async remove(id: string) {
    await this.ensure(id);
    // Proteksi relasi: jangan hapus perusahaan selama masih ada data client aktif
    // yang terhubung, agar data client tidak kehilangan referensi perusahaannya.
    const activeClients = await this.prisma.client.count({
      where: { companyClientId: id, deletedAt: null },
    });
    if (activeClients > 0) {
      throw new ConflictException(
        `Tidak dapat menghapus perusahaan: masih ada ${activeClients} data client yang terhubung. Hapus atau pindahkan data client tersebut lebih dahulu.`,
      );
    }
    return this.prisma.companyClient.update({ where: { id }, data: { deletedAt: new Date() } });
  }
  private async ensure(id: string) {
    const f = await this.prisma.companyClient.findFirst({ where: { id, deletedAt: null } });
    if (!f) throw new NotFoundException('Perusahaan client tidak ditemukan.');
  }
}
