import { IsUUID } from 'class-validator';

export class AddProjectMemberDto {
  /** UUID user (umumnya role PRODUKSI) yang ditambahkan sebagai anggota proyek. */
  @IsUUID() userId: string;
}
