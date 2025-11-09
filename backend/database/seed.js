require('dotenv').config();
const db = require('./connection');

// Helper function to promisify database operations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

async function seed() {
  try {
    console.log('Seeding database with test data...\n');

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const currentMonthName = monthNames[now.getMonth()];

    // Create current month
    console.log(`Creating ${currentMonthName} ${currentYear}...`);
    const monthResult = await dbRun(
      'INSERT INTO months (month_name, year, income) VALUES (?, ?, ?)',
      [currentMonthName, currentYear, 1936193] // 19361.93 in cents
    );
    const monthId = monthResult.id;
    console.log(`✓ Created month (ID: ${monthId})`);

    // Add fixed payments
    console.log('\nAdding fixed payments...');
    await dbRun(
      'INSERT INTO fixed_payments (month_id, name, amount, order_index) VALUES (?, ?, ?, ?)',
      [monthId, 'Selfoon kontrak', 10900, 0]
    );
    await dbRun(
      'INSERT INTO fixed_payments (month_id, name, amount, order_index) VALUES (?, ?, ?, ?)',
      [monthId, 'Water en ligte', 35600, 1]
    );
    console.log('✓ Added 2 fixed payments');

    // Add budget categories
    console.log('\nAdding budget categories...');
    const groceriesResult = await dbRun(
      'INSERT INTO budget_categories (month_id, name, allocated_amount, order_index) VALUES (?, ?, ?, ?)',
      [monthId, 'Groceries', 100000, 0]
    );
    const groceriesId = groceriesResult.id;

    const petrolResult = await dbRun(
      'INSERT INTO budget_categories (month_id, name, allocated_amount, order_index) VALUES (?, ?, ?, ?)',
      [monthId, 'Petrol', 150000, 1]
    );
    const petrolId = petrolResult.id;

    console.log('✓ Added 2 budget categories');

    // Add transactions (using current month dates)
    console.log('\nAdding transactions...');
    const firstDay = `${currentYear}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-01`;
    const fifthDay = `${currentYear}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-05`;
    const tenthDay = `${currentYear}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-10`;

    // Groceries transactions
    await dbRun(
      'INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [groceriesId, 87686, 'Kwikspar', firstDay]
    );

    // Petrol transactions
    await dbRun(
      'INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [petrolId, 86500, '', fifthDay]
    );

    console.log('✓ Added 2 transactions');

    console.log('\n✓ Database seeded successfully!');
    console.log('\nYou can now access:');
    console.log('  - API: http://localhost:3000/api/months');
    console.log('  - Frontend: http://localhost:4200');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    db.close();
  }
}

seed();
