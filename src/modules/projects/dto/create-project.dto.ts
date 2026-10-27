import {
  IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min,
} from 'class-validator';
import { KategoriProyek } from '@prisma/client';

export class CreateProjectDto {
  /**
   * Nama proyek
   * @example Launching Produk XYZ 2024
   */
  @IsString() name: string;

  /**
   * Deskripsi singkat proyek
   * @example Event peluncuran produk baru di Jakarta Convention Center
   */
  @IsOptional() @IsString() description?: string;

  /**
   * Kategori proyek
   * @example CREATIVE_EVENT
   */
  @IsEnum(KategoriProyek) category: KategoriProyek;

  /**
   * UUID client pemilik proyek
   * @example d290f1ee-6c54-4b01-90e6-d701748f0851
   */
  @IsUUID() clientId: string;

  /**
   * UUID user yang menjadi Project Manager (opsional)
   * @example a3bb189e-8bf9-3888-9912-ace4e6543002
   */
  @IsOptional() @IsUUID() projectManagerId?: string;

  /**
   * Tipe client
   * @example Swasta
   */
  @IsOptional() @IsString() clientType?: string;

  /**
   * Model kemitraan
   * @example Revenue Share
   */
  @IsOptional() @IsString() partnershipModel?: string;

  /**
   * Lokasi / venue acara
   * @example Jakarta Convention Center, Jakarta
   */
  @IsOptional() @IsString() venue?: string;

  /**
   * Nilai kontrak dalam Rupiah
   * @example 150000000
   */
  @IsOptional() @IsNumber() @Min(0) contractValue?: number;

  /**
   * Tanggal pelaksanaan event (ISO 8601)
   * @example 2024-12-31
   */
  @IsOptional() @IsDateString() eventDate?: string;

  /**
   * Tanggal mulai proyek (ISO 8601)
   * @example 2024-10-01
   */
  @IsOptional() @IsDateString() startDate?: string;

  /**
   * Tanggal selesai proyek (ISO 8601)
   * @example 2024-12-31
   */
  @IsOptional() @IsDateString() endDate?: string;
}
