const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Helper function to promisify database operations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// GET /api/months - List all months
router.get('/', async (req, res) => {
  try {
    const months = await dbAll(`
      SELECT id, month_name, year, income, created_at
      FROM months
      ORDER BY year DESC,
        CASE month_name
          WHEN 'January' THEN 1
          WHEN 'February' THEN 2
          WHEN 'March' THEN 3
          WHEN 'April' THEN 4
          WHEN 'May' THEN 5
          WHEN 'June' THEN 6
          WHEN 'July' THEN 7
          WHEN 'August' THEN 8
          WHEN 'September' THEN 9
          WHEN 'October' THEN 10
          WHEN 'November' THEN 11
          WHEN 'December' THEN 12
        END DESC
    `);

    // Convert cents to rands
    const formattedMonths = months.map(m => ({
      ...m,
      income: m.income / 100
    }));

    res.json(formattedMonths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/months/:id - Get full month data with all related records
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get month details
    const month = await dbGet('SELECT * FROM months WHERE id = ?', [id]);

    if (!month) {
      return res.status(404).json({ error: 'Month not found' });
    }

    // Get fixed payments
    const fixedPayments = await dbAll(
      'SELECT * FROM fixed_payments WHERE month_id = ? ORDER BY order_index',
      [id]
    );

    // Get budget categories
    const categories = await dbAll(
      'SELECT * FROM budget_categories WHERE month_id = ? ORDER BY order_index',
      [id]
    );

    // Get transactions for each category
    const categoriesWithTransactions = await Promise.all(
      categories.map(async (category) => {
        const transactions = await dbAll(
          'SELECT * FROM transactions WHERE category_id = ? ORDER BY transaction_date, created_at',
          [category.id]
        );
        return {
          ...category,
          allocated_amount: category.allocated_amount / 100,
          transactions: transactions.map(t => ({
            ...t,
            amount: t.amount / 100
          }))
        };
      })
    );

    // Format response
    const response = {
      ...month,
      income: month.income / 100,
      fixedPayments: fixedPayments.map(fp => ({
        ...fp,
        amount: fp.amount / 100
      })),
      categories: categoriesWithTransactions
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/months - Create new month
router.post('/', async (req, res) => {
  try {
    const { month_name, year, income, copyFromMonthId } = req.body;

    if (!month_name || !year) {
      return res.status(400).json({ error: 'month_name and year are required' });
    }

    // Convert income to cents
    const incomeInCents = Math.round((income || 0) * 100);

    // Create month record
    const result = await dbRun(
      'INSERT INTO months (month_name, year, income) VALUES (?, ?, ?)',
      [month_name, year, incomeInCents]
    );

    const newMonthId = result.id;

    // If copyFromMonthId is provided, copy structure from previous month
    if (copyFromMonthId) {
      // Copy fixed payments
      const previousFixedPayments = await dbAll(
        'SELECT name, amount, order_index FROM fixed_payments WHERE month_id = ?',
        [copyFromMonthId]
      );

      for (const fp of previousFixedPayments) {
        await dbRun(
          'INSERT INTO fixed_payments (month_id, name, amount, order_index) VALUES (?, ?, ?, ?)',
          [newMonthId, fp.name, fp.amount, fp.order_index]
        );
      }

      // Copy budget categories (but not transactions)
      const previousCategories = await dbAll(
        'SELECT name, allocated_amount, order_index FROM budget_categories WHERE month_id = ?',
        [copyFromMonthId]
      );

      for (const cat of previousCategories) {
        await dbRun(
          'INSERT INTO budget_categories (month_id, name, allocated_amount, order_index) VALUES (?, ?, ?, ?)',
          [newMonthId, cat.name, cat.allocated_amount, cat.order_index]
        );
      }
    }

    // Fetch and return the complete new month
    const newMonth = await dbGet('SELECT * FROM months WHERE id = ?', [newMonthId]);
    res.status(201).json({
      ...newMonth,
      income: newMonth.income / 100
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Month already exists for this year' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/months/:id - Update month (income only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { income } = req.body;

    if (income === undefined) {
      return res.status(400).json({ error: 'income is required' });
    }

    // Convert to cents
    const incomeInCents = Math.round(income * 100);

    const result = await dbRun(
      'UPDATE months SET income = ? WHERE id = ?',
      [incomeInCents, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Month not found' });
    }

    const updatedMonth = await dbGet('SELECT * FROM months WHERE id = ?', [id]);
    res.json({
      ...updatedMonth,
      income: updatedMonth.income / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/months/:id - Delete month (cascades to all related records)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dbRun('DELETE FROM months WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Month not found' });
    }

    res.json({ message: 'Month deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/months/:id/summary - Get calculated summary for month
router.get('/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;

    // Get month
    const month = await dbGet('SELECT * FROM months WHERE id = ?', [id]);
    if (!month) {
      return res.status(404).json({ error: 'Month not found' });
    }

    // Get fixed payments total
    const fixedPaymentsResult = await dbGet(
      'SELECT COALESCE(SUM(amount), 0) as total FROM fixed_payments WHERE month_id = ?',
      [id]
    );
    const fixedPaymentsTotal = fixedPaymentsResult.total;

    // Calculate after fixed payments
    const afterFixedPayments = month.income - fixedPaymentsTotal;

    // Get budget allocations total
    const budgetAllocationsResult = await dbGet(
      'SELECT COALESCE(SUM(allocated_amount), 0) as total FROM budget_categories WHERE month_id = ?',
      [id]
    );
    const budgetAllocationsTotal = budgetAllocationsResult.total;

    // Calculate after budget allocations
    const afterBudgetAllocations = afterFixedPayments - budgetAllocationsTotal;

    // Get per-category spending
    const categories = await dbAll(
      'SELECT id, name, allocated_amount FROM budget_categories WHERE month_id = ?',
      [id]
    );

    const categorySpending = await Promise.all(
      categories.map(async (category) => {
        const spendingResult = await dbGet(
          'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE category_id = ?',
          [category.id]
        );
        const spent = spendingResult.total;
        const remaining = category.allocated_amount - spent;
        const overBudget = remaining < 0 ? Math.abs(remaining) : 0;

        return {
          categoryId: category.id,
          categoryName: category.name,
          allocated: category.allocated_amount / 100,
          spent: spent / 100,
          remaining: remaining > 0 ? remaining / 100 : 0,
          overBudget: overBudget / 100
        };
      })
    );

    // Get total actual spending
    const totalSpendingResult = await dbGet(`
      SELECT COALESCE(SUM(t.amount), 0) as total
      FROM transactions t
      JOIN budget_categories bc ON t.category_id = bc.id
      WHERE bc.month_id = ?
    `, [id]);
    const totalActualSpending = totalSpendingResult.total;

    // Calculate total money left
    const totalMoneyLeft = afterFixedPayments - totalActualSpending;

    res.json({
      monthId: id,
      monthName: month.month_name,
      year: month.year,
      income: month.income / 100,
      fixedPaymentsTotal: fixedPaymentsTotal / 100,
      afterFixedPayments: afterFixedPayments / 100,
      budgetAllocationsTotal: budgetAllocationsTotal / 100,
      afterBudgetAllocations: afterBudgetAllocations / 100,
      totalActualSpending: totalActualSpending / 100,
      totalMoneyLeft: totalMoneyLeft / 100,
      categorySpending
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
