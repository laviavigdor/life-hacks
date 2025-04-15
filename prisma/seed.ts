import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.diary.deleteMany();

    // Sample diary entries
    const entries = [
        {
            entry: "Ran 5k in 30 minutes this morning. Felt great!",
            insights: JSON.stringify({
                activity: "run",
                metrics: [
                    { type: "distance", value: 5, unit: "km" },
                    { type: "duration", value: 30, unit: "minutes" },
                    { type: "pace", value: 6, unit: "min/km" }
                ]
            })
        },
        {
            entry: "Did 3 sets of 10 pushups after lunch",
            insights: JSON.stringify({
                activity: "strength_training",
                metrics: [
                    { type: "sets", value: 3, unit: "sets" },
                    { type: "reps", value: 10, unit: "reps" },
                    { type: "exercise", value: "pushups", unit: null }
                ]
            })
        },
        {
            entry: "Meditated for 15 minutes before bed",
            insights: JSON.stringify({
                activity: "meditation",
                metrics: [
                    { type: "duration", value: 15, unit: "minutes" }
                ]
            })
        }
    ];

    // Insert entries
    for (const entry of entries) {
        await prisma.diary.create({
            data: entry
        });
    }

    console.log('Seed data inserted successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 