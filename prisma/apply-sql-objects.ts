import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseSqlStatements(rawSql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inDollarQuote = false;
  let inSingleQuote = false;
  let i = 0;

  while (i < rawSql.length) {
    const char = rawSql[i];
    const nextChar = rawSql[i + 1];

    // Single line comments --
    if (!inDollarQuote && !inSingleQuote && char === '-' && nextChar === '-') {
      while (i < rawSql.length && rawSql[i] !== '\n') {
        i++;
      }
      i++;
      continue;
    }

    // Dollar quote $$
    if (!inSingleQuote && char === '$' && nextChar === '$') {
      inDollarQuote = !inDollarQuote;
      current += '$$';
      i += 2;
      continue;
    }

    // Single quote '
    if (!inDollarQuote && char === "'") {
      if (nextChar === "'") {
        current += "''";
        i += 2;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      current += "'";
      i++;
      continue;
    }

    // Statement terminator ;
    if (!inDollarQuote && !inSingleQuote && char === ';') {
      const stmt = current.trim();
      if (stmt) statements.push(stmt);
      current = '';
      i++;
      continue;
    }

    current += char;
    i++;
  }

  const stmt = current.trim();
  if (stmt) statements.push(stmt);

  return statements;
}

async function main() {
  const sqlDir = path.join(__dirname, 'sql');
  if (!fs.existsSync(sqlDir)) {
    console.error(`❌ Folder SQL tidak ditemukan di ${sqlDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(sqlDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`🔍 Memproses ${files.length} file SQL kustom...`);

  for (const file of files) {
    const filePath = path.join(sqlDir, file);
    console.log(`→ Menerapkan ${file}...`);
    const rawSql = fs.readFileSync(filePath, 'utf8');
    const statements = parseSqlStatements(rawSql);

    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (err: any) {
        console.error(`❌ Gagal menerapkan statement di ${file}:\n${stmt}\nError: ${err.message}`);
        process.exit(1);
      }
    }
    console.log(`  ✓ ${file} (${statements.length} instruksi) berhasil diterapkan.`);
  }

  console.log('✅ Semua objek database (Views, Functions, Triggers) berhasil diterapkan!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
