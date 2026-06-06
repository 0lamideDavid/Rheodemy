import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const course = await prisma.course.findFirst({ where: { title: "AI and Machine Learning Foundations" } });
  console.log(course);
}
main().catch(console.error).finally(() => prisma.$disconnect());
