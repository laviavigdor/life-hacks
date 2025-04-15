import Database from 'better-sqlite3';

// Initialize SQLite database
const db = new Database('life-hacks.db');

// Create diary table
const createTable = `
CREATE TABLE IF NOT EXISTS diary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry TEXT NOT NULL,
    insights TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

console.log('Setting up database...');
db.exec(createTable);
console.log('Database setup complete!');

// Insert test data
const testData = [
    {
        entry: "Ran 5k in 30 min",
        created_at: "2024-03-20T10:00:00Z"
    },
    {
        entry: "Did 3 sets of 10 pushups",
        created_at: "2024-03-20T15:00:00Z"
    },
    {
        entry: "Ate 200g of chicken with rice",
        created_at: "2024-03-20T19:00:00Z"
    }
];

const insertStmt = db.prepare('INSERT INTO diary (entry, created_at) VALUES (?, ?)');
console.log('Inserting test data...');
for (const data of testData) {
    insertStmt.run(data.entry, data.created_at);
}
console.log('Test data inserted!');

// Close the database connection
db.close(); 