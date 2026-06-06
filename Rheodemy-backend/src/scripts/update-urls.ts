import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result1 = await prisma.lesson.updateMany({
    where: { contentUrl: 'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe680T1' },
    data: { contentUrl: 'VCZzOAAVqd4f5n5kshNtpfHXyhxgB6aUVBJxPiJvTgY' }
  });
  console.log('Updated', result1.count, 'lessons from DS00... to VCZz...');

  const result2 = await prisma.lesson.updateMany({
    where: { contentUrl: 'jy02Y501NLjgcgnNQbhiDQrbTtNZqIpdSYpT02KpPLzHzs' },
    data: { contentUrl: 'VCZzOAAVqd4f5n5kshNtpfHXyhxgB6aUVBJxPiJvTgY' }
  });
  console.log('Updated', result2.count, 'lessons from jy02... to VCZz...');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
