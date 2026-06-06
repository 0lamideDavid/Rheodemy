import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running live DB updates...');

  const ebookContent = `Page 1 — The Problem With Learning Today\n\nEducation has never been more accessible, yet never more wasteful. You pay $200 for a course, watch three videos, and never return. The platform keeps your money. The instructor keeps your money. You keep nothing but guilt.\n\nRheodemy was built because this is wrong.\n\nPage 2 — A New Contract Between Learner and Creator\n\nWhat if you only paid for what you actually learned? Not what you intended to learn. Not what you bought access to. What you actually consumed, second by second, page by page.\n\nThis is the Rheodemy promise. Pay as you learn. Stop paying when you stop learning.\n\nPage 3 — How the Stream Works\n\nWhen you press play on Rheodemy, a payment stream opens between your wallet and the creator's wallet via the Interledger Protocol — the open standard for moving money across any network, any currency, any border.\n\nNo intermediary holds your money. No platform sits between you and the creator.\n\nPage 4 — The Interledger Protocol\n\nInterledger is to money what the internet is to information. It is an open protocol that allows value to flow freely across payment networks — from mobile money in Lagos to digital wallets in London — instantly and with microscopic fees.\n\nRheodemy is one of the first learning platforms built natively on this infrastructure.\n\nPage 5 — What Micropayments Change\n\nWhen payments are small enough — fractions of a cent per second — something fundamental shifts. The creator is incentivised to keep you engaged every single moment, not just to sell you a course.\n\nThe learner is free to stop anytime without losing a large upfront investment. Trust is built into the transaction itself.\n\nPage 6 — The 80/15/5 Split\n\nEvery payment on Rheodemy is automatically split at the moment of transaction. 80% flows instantly to the creator. 15% sustains the platform. 5% goes to the Rheodemy Bursary Fund — supporting learners in low-income regions who cannot afford even micropayments.\n\nNo invoices. No monthly payouts. No waiting.\n\nPage 7 — The Bursary Fund\n\nThe 5% bursary is not a charity add-on. It is a structural commitment. Every stream on Rheodemy — every second of learning — contributes to a pool that funds access for those who need it most.\n\nKnowledge should not be a luxury.\n\nPage 8 — For Creators\n\nOn Rheodemy, your earnings are not locked behind a threshold. They are not held by a platform for 30 days. They flow to your wallet in real time as students learn.\n\nA student in Nairobi watching your course at 2am earns you money at 2am. No delays. No borders.\n\nPage 9 — For Learners\n\nYou are no longer a customer making a bet. You are a learner making a choice — moment by moment. If the content stops being valuable, you stop paying. If you want to rewatch something you already paid for, you rewatch it free.\n\nRheodemy respects your time and your money equally.\n\nPage 10 — The High Water Mark\n\nRheodemy tracks the furthest point you have reached in any piece of content. Rewinding to revisit something you already paid for is always free.\n\nYou are never penalised for reviewing. You are only charged for discovering something new.\n\nPage 11 — Content Without Borders\n\nRheodemy supports video, audio, and written content. A developer in Lagos can publish a coding course. A writer in Accra can publish a business ebook. A podcaster in London can monetise every minute of audio.\n\nThe format does not matter. The knowledge does.\n\nPage 12 — The Skip Economy\n\nIf you choose to skip forward in a lesson, Rheodemy charges you for the content you skipped. You chose to consume it — even if you consumed it at speed.\n\nThis keeps the incentive honest. Creators are rewarded for every second of value they create.\n\nPage 13 — Privacy By Design\n\nRheodemy does not sell your data. It does not show you ads. It does not build a profile of your learning habits to sell to employers or insurers.\n\nYour learning is yours. The only data that moves is the payment — and that moves directly to the creator.\n\nPage 14 — The Road Ahead\n\nRheodemy is beginning with video, audio, and written content. But the protocol is content-agnostic. Interactive coding environments, live mentorship sessions, AI tutors — all of these can be streamed and paid for by the second.\n\nThe infrastructure is ready. The content is coming.\n\nPage 15 — Join the Stream\n\nYou are reading this on a platform that is paying the author right now — per page, per second, per idea consumed.\n\nThis is not the future of education. This is education as it should always have been.\n\nWelcome to Rheodemy.`;

  // Update Course 1: Mastering TypeScript -> Web Development for Beginners
  const c1 = await prisma.course.findFirst({
    where: { title: { in: ["Mastering TypeScript", "Web Development for Beginners"] } }
  });

  if (c1) {
    await prisma.course.update({
      where: { id: c1.id },
      data: { 
        title: "Web Development for Beginners",
        pricePerMinute: 4.00 
      }
    });
    
    // Check if manifesto lesson exists
    const manifestoExists = await prisma.lesson.findFirst({
      where: { courseId: c1.id, title: "The Rheodemy Learning Manifesto" }
    });
    
    if (!manifestoExists) {
      await prisma.lesson.create({
        data: {
          courseId: c1.id,
          title: "The Rheodemy Learning Manifesto",
          description: "Read about the future of education.",
          contentUrl: ebookContent,
          contentType: 'EBOOK',
          durationSec: 0,
          order: 3
        }
      });
      console.log('Created manifesto ebook lesson.');
    }
  }

  // Update Course 2: Advanced UI/UX Design -> Mastering React and Next.js
  const c2 = await prisma.course.findFirst({
    where: { title: { in: ["Advanced UI/UX Design Masterclass", "Mastering React and Next.js"] } }
  });

  if (c2) {
    await prisma.course.update({
      where: { id: c2.id },
      data: { 
        title: "Mastering React and Next.js",
        pricePerMinute: 2.50 
      }
    });
  }

  // Update Course 5: AI and Machine Learning Foundations
  let c5 = await prisma.course.findFirst({
    where: { title: { in: ["Tech Leaders Podcast (Audio)", "AI and Machine Learning Foundations"] } }
  });

  if (c5) {
    await prisma.course.update({
      where: { id: c5.id },
      data: {
        title: "AI and Machine Learning Foundations",
        description: "Discover the fundamentals of AI through our comprehensive guide.",
        pricePerMinute: 2.00,
        thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600&auto=format&fit=crop"
      }
    });

    const hasVideoLessons = await prisma.lesson.count({
      where: { courseId: c5.id, contentType: 'VIDEO' }
    });

    if (hasVideoLessons !== 5) {
      // Delete existing lessons and recreate the 5 video lessons
      await prisma.lesson.deleteMany({ where: { courseId: c5.id } });
      
      await prisma.lesson.createMany({
        data: [
          { courseId: c5.id, title: "Module 1: Introduction", description: "What is AI?", contentUrl: "VCZzOAAVqd4f5n5kshNtpfHXyhxgB6aUVBJxPiJvTgY", contentType: 'VIDEO', durationSec: 300, order: 1 },
          { courseId: c5.id, title: "Module 2: Machine Learning", description: "Basics of ML.", contentUrl: "VCZzOAAVqd4f5n5kshNtpfHXyhxgB6aUVBJxPiJvTgY", contentType: 'VIDEO', durationSec: 300, order: 2 },
          { courseId: c5.id, title: "Module 3: Neural Networks", description: "Deep learning.", contentUrl: "VCZzOAAVqd4f5n5kshNtpfHXyhxgB6aUVBJxPiJvTgY", contentType: 'VIDEO', durationSec: 300, order: 3 },
          { courseId: c5.id, title: "Module 4: NLP", description: "Natural Language Processing.", contentUrl: "VCZzOAAVqd4f5n5kshNtpfHXyhxgB6aUVBJxPiJvTgY", contentType: 'VIDEO', durationSec: 300, order: 4 },
          { courseId: c5.id, title: "Module 5: Future of AI", description: "Ethics and future.", contentUrl: "VCZzOAAVqd4f5n5kshNtpfHXyhxgB6aUVBJxPiJvTgY", contentType: 'VIDEO', durationSec: 300, order: 5 },
        ]
      });
      console.log('Updated AI course with 5 video lessons.');
    }
  }

  // Create Course 6: The African Tech Podcast
  const c6Exists = await prisma.course.findFirst({
    where: { title: "The African Tech Podcast — Learning Series" }
  });

  if (!c6Exists) {
    const instructor = await prisma.user.findFirst({ where: { role: 'INSTRUCTOR' } });
    if (instructor) {
      const c6 = await prisma.course.create({
        data: {
          title: "The African Tech Podcast — Learning Series",
          description: "Conversations about technology, startups, and innovation across Africa. Listen and learn from founders, engineers, and investors building the future.",
          pricePerMinute: 1.30,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600&auto=format&fit=crop"
        }
      });
      await prisma.lesson.create({
        data: {
          courseId: c6.id,
          title: "Episode 1 — Introduction to AI in Africa",
          description: "Audio podcast.",
          contentUrl: "https://rheodemymvp.vercel.app/audio/intro-ai-audio.mp3",
          contentType: 'AUDIO',
          durationSec: 180,
          order: 1
        }
      });
      console.log('Created Podcast course.');
    }
  } else {
    // If it exists, update price
    await prisma.course.update({
      where: { id: c6Exists.id },
      data: { pricePerMinute: 1.30 }
    });
    console.log('Podcast course already exists, updated price.');
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
