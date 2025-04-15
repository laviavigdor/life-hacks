export const EXAMPLES = [
    {
        input: "Ran 5k in 30 minutes this morning",
        output: {
            summary: "Completed a 5km run in 30 minutes",
            metrics: [
                {
                    type: "distance",
                    value: 5,
                    unit: "km",
                    confidence: 0.95
                },
                {
                    type: "duration",
                    value: 30,
                    unit: "minutes",
                    confidence: 0.95
                },
                {
                    type: "pace",
                    value: 6,
                    unit: "min/km",
                    confidence: 0.9
                }
            ],
            confidence: 0.95,
            tags: ["exercise", "cardio", "running"]
        }
    },
    {
        input: "Meditated for about 10 minutes before bed, feeling calmer",
        output: {
            summary: "Evening meditation session with positive mood impact",
            metrics: [
                {
                    type: "duration",
                    value: 10,
                    unit: "minutes",
                    confidence: 0.8
                },
                {
                    type: "mood_impact",
                    value: "positive",
                    unit: null,
                    confidence: 0.7
                }
            ],
            confidence: 0.85,
            tags: ["meditation", "mindfulness", "evening_routine", "mood"]
        }
    }
]; 