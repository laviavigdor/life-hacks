# Life Hacks

A smart personal life tracking system that uses natural language processing to extract insights from your daily activities.

## Features (MVP)

- Natural language input for tracking activities
- Automatic insight extraction using LLM
- Dynamic metric tracking and categorization
- Basic visualization of trends and patterns
- Simple query interface for data analysis

## Tech Stack

- Next.js with TypeScript
- SQLite for data storage
- OpenAI for natural language processing
- shadcn/ui for components
- Chart.js for visualizations

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run database migrations:
   ```bash
   npm run db:migrate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Development

See [docs/todo.md](docs/todo.md) for the development roadmap and specifications.

## Project Structure

```
.
├── app/          # Next.js application code
├── components/   # React components
├── lib/         # Utility functions and shared code
├── db/          # Database schema and migrations
└── docs/        # Project documentation
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT 