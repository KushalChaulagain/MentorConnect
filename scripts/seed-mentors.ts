import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MENTOR_COUNT = 20;

const expertise = [
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Mobile Development',
  'DevOps',
  'Cloud Computing',
  'Machine Learning',
  'Data Science',
  'Cybersecurity',
  'UI/UX Design',
];

const languages = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Hindi', 'Japanese'];

const skills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C#',
  'AWS',
  'Docker',
  'Kubernetes',
  'SQL',
  'MongoDB',
  'GraphQL',
  'Next.js',
  'Vue.js',
  'Angular',
];

async function main() {
  console.log('🌱 Starting to seed dummy mentors...');

  for (let i = 0; i < MENTOR_COUNT; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    // Create user with mentor role
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        role: 'MENTOR',
        onboardingCompleted: true,
        image: faker.image.avatar(),
        mentorProfile: {
          create: {
            title: faker.person.jobTitle(),
            company: faker.company.name(),
            bio: faker.lorem.paragraphs(2),
            expertise: faker.helpers.arrayElements(expertise, { min: 2, max: 4 }),
            languages: faker.helpers.arrayElements(languages, { min: 1, max: 3 }),
            skills: faker.helpers.arrayElements(skills, { min: 4, max: 8 }),
            experience: faker.helpers.arrayElement(['1-3 years', '3-5 years', '5-10 years', '10+ years']),
            interests: Array.from({ length: 3 }, () => faker.lorem.words(2)),
            goals: Array.from({ length: 2 }, () => faker.lorem.sentence()),
            hourlyRate: parseFloat(faker.number.float({ min: 50, max: 200, fractionDigits: 2 }).toFixed(2)),
            rating: parseFloat(faker.number.float({ min: 4, max: 5, fractionDigits: 1 }).toFixed(1)),
            github: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
            linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
            website: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.6 }),
          },
        },
      },
      include: {
        mentorProfile: true
      }
    });

    // Generate some availability slots for each mentor
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const availabilityPromises = days.map((day) => {
      const slots = Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => ({
        start: `${faker.number.int({ min: 9, max: 16 })}:00`,
        end: `${faker.number.int({ min: 17, max: 20 })}:00`,
      }));

      return prisma.availability.create({
        data: {
          mentorProfileId: user.mentorProfile!.id,
          day,
          slots,
        },
      });
    });

    await Promise.all(availabilityPromises);
    console.log(`✅ Created mentor: ${user.name}`);
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding mentors:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 