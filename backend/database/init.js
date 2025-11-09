require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./connection');

// Read schema file
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split schema into individual statements
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

console.log('Initializing database...');

// Execute each statement
db.serialize(() => {
  statements.forEach((statement, index) => {
    db.run(statement, (err) => {
      if (err) {
        console.error(`Error executing statement ${index + 1}:`, err.message);
        console.error('Statement:', statement);
      } else {
        console.log(`✓ Statement ${index + 1} executed successfully`);
      }
    });
  });
});

// Close database connection after all statements
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('\n✓ Database initialized successfully!');
  }
});
