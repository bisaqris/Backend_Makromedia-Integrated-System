import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateInvoiceSettingDto } from './dto/invoice-setting.dto';

// Default Terms & Condition + instruksi pembayaran (dipakai saat record pertama dibuat).
const DEFAULT_TERMS = [
  'Pembayaran wajib dilakukan paling lambat sesuai tanggal jatuh tempo yang tercantum.',
  'Pembayaran transfer hanya dianggap sah apabila ditransfer ke rekening bank resmi yang tercantum.',
  'Bukti transfer mohon dikirimkan melalui WhatsApp Finance atau email resmi Makromedia.',
];
const DEFAULT_PAYMENT_INSTRUCTION =
  'Pembayaran dapat ditransfer melalui rekening yang tercantum di atas. Mohon cantumkan nomor invoice pada berita transfer.';

@Injectable()
export class InvoiceSettingsService {
  constructor(private prisma: PrismaService) {}

  /** Singleton: kembalikan satu-satunya record; buat dengan default bila belum ada. */
  async get() {
    const existing = await this.prisma.invoiceSetting.findFirst();
    if (existing) return existing;
    return this.prisma.invoiceSetting.create({
      data: {
        pphPercent: 2,
        termsOfCondition: DEFAULT_TERMS,
        paymentInstruction: DEFAULT_PAYMENT_INSTRUCTION,
        bankAccounts: [],
      },
    });
  }

  async update(dto: UpdateInvoiceSettingDto) {
    const current = await this.get();
    const data: Prisma.InvoiceSettingUpdateInput = {
      ...(dto.pphPercent !== undefined && { pphPercent: dto.pphPercent }),
      ...(dto.termsOfCondition !== undefined && { termsOfCondition: dto.termsOfCondition }),
      ...(dto.paymentInstruction !== undefined && { paymentInstruction: dto.paymentInstruction }),
      ...(dto.bankAccounts !== undefined && {
        bankAccounts: dto.bankAccounts as unknown as Prisma.InputJsonValue,
      }),
      ...(dto.signerName !== undefined && { signerName: dto.signerName }),
      ...(dto.signerPosition !== undefined && { signerPosition: dto.signerPosition }),
      ...(dto.signerSignatureUrl !== undefined && { signerSignatureUrl: dto.signerSignatureUrl }),
      ...(dto.signerUserId !== undefined && { signerUserId: dto.signerUserId }),
    };
    return this.prisma.invoiceSetting.update({ where: { id: current.id }, data });
  }
}
