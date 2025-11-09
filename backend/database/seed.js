require('dotenv').config();
const db = require('./connection');

// Helper function to promisify database operations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

async function seed() {
  try {
    console.log('Seeding database with test data...\n');

    // Create August 2022 month
    console.log('Creating August 2022...');
    const augustResult = await dbRun(
      'INSERT INTO months (month_name, year, income) VALUES (?, ?, ?)',
      ['August', 2022, 1936193] // 19361.93 in cents
    );
    const augustId = augustResult.id;
    console.log(`✓ Created month (ID: ${augustId})`);

    // Add fixed payments for August
    console.log('\nAdding fixed payments...');
    await dbRun('INSERT INTO fixed_payments (month_id, name, amount, order_index) VALUES (?, ?, ?, ?)',
      [augustId, 'Selfoon kontrak', 10900, 0]);
    await dbRun('INSERT INTO fixed_payments (month_id, name, amount, order_index) VALUES (?, ?, ?, ?)',
      [augustId, 'Netflix', 9900, 1]);
    await dbRun('INSERT INTO fixed_payments (month_id, name, amount, order_index) VALUES (?, ?, ?, ?)',
      [augustId, 'Huur', 975000, 2]);
    await dbRun('INSERT INTO fixed_payments (month_id, name, amount, order_index) VALUES (?, ?, ?, ?)',
      [augustId, 'APO Payment', 35000, 3]);
    console.log('✓ Added 4 fixed payments');

    // Add budget categories for August
    console.log('\nAdding budget categories...');
    const groceriesResult = await dbRun(
      'INSERT INTO budget_categories (month_id, name, allocated_amount, order_index) VALUES (?, ?, ?, ?)',
      [augustId, 'Groceries', 100000, 0]
    );
    const groceriesId = groceriesResult.id;

    const mealPrepResult = await dbRun(
      'INSERT INTO budget_categories (month_id, name, allocated_amount, order_index) VALUES (?, ?, ?, ?)',
      [augustId, 'Meal Prep', 150000, 1]
    );
    const mealPrepId = mealPrepResult.id;

    const petrolResult = await dbRun(
      'INSERT INTO budget_categories (month_id, name, allocated_amount, order_index) VALUES (?, ?, ?, ?)',
      [augustId, 'Petrol', 150000, 2]
    );
    const petrolId = petrolResult.id;

    const fietsryResult = await dbRun(
      'INSERT INTO budget_categories (month_id, name, allocated_amount, order_index) VALUES (?, ?, ?, ?)',
      [augustId, 'Fietsry', 150000, 3]
    );
    const fietsryId = fietsryResult.id;

    const uiteetResult = await dbRun(
      'INSERT INTO budget_categories (month_id, name, allocated_amount, order_index) VALUES (?, ?, ?, ?)',
      [augustId, 'Uiteet', 50000, 4]
    );
    const uiteetId = uiteetResult.id;

    const washingResult = await dbRun(
      'INSERT INTO budget_categories (month_id, name, allocated_amount, order_index) VALUES (?, ?, ?, ?)',
      [augustId, 'Washing', 80000, 5]
    );
    const washingId = washingResult.id;

    console.log('✓ Added 6 budget categories');

    // Add transactions
    console.log('\nAdding transactions...');

    // Groceries transactions
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [groceriesId, 7500, 'ID foto', '2022-08-01']);
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [groceriesId, 45686, 'Kwikspar', '2022-08-05']);
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [groceriesId, 105246, 'Checkers D North', '2022-08-10']);
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [groceriesId, 39417, 'Checkers Virginia Circ', '2022-08-15']);
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [groceriesId, 12097, 'Checkers Cascades', '2022-08-20']);
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [groceriesId, 34743, '', '2022-08-25']);

    // Petrol transactions
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [petrolId, 89371, '', '2022-08-08']);
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [petrolId, 80156, '', '2022-08-22']);

    // Uiteet transactions
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [uiteetId, 9000, '', '2022-08-05']);
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [uiteetId, 3550, '', '2022-08-12']);
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [uiteetId, 3200, '', '2022-08-18']);
    await dbRun('INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [uiteetId, 7800, '', '2022-08-25']);

    console.log('✓ Added 13 transactions');

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
