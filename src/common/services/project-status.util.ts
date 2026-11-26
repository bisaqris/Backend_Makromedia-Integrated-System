import { BadRequestException } from '@nestjs/common';
import { StatusProyek } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Kunci perubahan pada proyek yang sudah final.
 * Proyek berstatus COMPLETED atau CANCELLED tidak boleh lagi diubah sub-resource-nya
 * (task, quotation, invoice, production cost, link, member, payment). Untuk mengedit
 * kembali, DIREKTUR harus mengubah status proyek ke ACTIVE/ON_HOLD lebih dahulu.
 */
export async function assertProjectEditable(
  prisma: PrismaService,
  projectId: string,
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { status: true },
  });
  // Keberadaan proyek divalidasi di pemanggil; di sini hanya cek status final.
  if (!project) return;
  if (project.status === StatusProyek.COMPLETED || project.status === StatusProyek.CANCELLED) {
    throw new BadRequestException(
      `Proyek berstatus ${project.status} terkunci dan tidak dapat diubah. ` +
        'Ubah status proyek kembali ke ACTIVE lebih dahulu (DIREKTUR) untuk mengedit.',
    );
  }
}
