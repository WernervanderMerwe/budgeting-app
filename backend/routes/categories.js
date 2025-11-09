const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Helper functions
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

// POST /api/months/:monthId/categories - Create budget category
router.post('/months/:monthId/categories', async (req, res) => {
  try {
    const { monthId } = req.params;
    const { name, allocated_amount, order_index } = req.body;

    if (!name || allocated_amount === undefined) {
      return res.status(400).json({ error: 'name and allocated_amount are required' });
    }

    // Check if month exists
    const month = await dbGet('SELECT id FROM months WHERE id = ?', [monthId]);
    if (!month) {
      return res.status(404).json({ error: 'Month not found' });
    }

    // Convert amount to cents
    const amountInCents = Math.round(allocated_amount * 100);

    // Get next order_index if not provided
    let orderIndex = order_index;
    if (orderIndex === undefined) {
      const maxOrderResult = await dbGet(
        'SELECT MAX(order_index) as max_order FROM budget_categories WHERE month_id = ?',
        [monthId]
      );
      orderIndex = (maxOrderResult.max_order || -1) + 1;
    }

    const result = await dbRun(
      'INSERT INTO budget_categories (month_id, name, allocated_amount, order_index) VALUES (?, ?, ?, ?)',
      [monthId, name, amountInCents, orderIndex]
    );

    const newCategory = await dbGet('SELECT * FROM budget_categories WHERE id = ?', [result.id]);
    res.status(201).json({
      ...newCategory,
      allocated_amount: newCategory.allocated_amount / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/categories/:id - Update budget category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, allocated_amount } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (allocated_amount !== undefined) {
      updates.push('allocated_amount = ?');
      params.push(Math.round(allocated_amount * 100));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    const result = await dbRun(
      `UPDATE budget_categories SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Budget category not found' });
    }

    const updatedCategory = await dbGet('SELECT * FROM budget_categories WHERE id = ?', [id]);
    res.json({
      ...updatedCategory,
      allocated_amount: updatedCategory.allocated_amount / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/categories/:id - Delete budget category (cascades to transactions)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dbRun('DELETE FROM budget_categories WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Budget category not found' });
    }

    res.json({ message: 'Budget category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/months/:monthId/categories/reorder - Reorder categories
router.put('/months/:monthId/categories/reorder', async (req, res) => {
  try {
    const { monthId } = req.params;
    const { categoryIds } = req.body; // Array of IDs in desired order

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ error: 'categoryIds must be an array' });
    }

    // Update order_index for each category
    for (let i = 0; i < categoryIds.length; i++) {
      await dbRun(
        'UPDATE budget_categories SET order_index = ? WHERE id = ? AND month_id = ?',
        [i, categoryIds[i], monthId]
      );
    }

    // Return updated list
    const categories = await dbAll(
      'SELECT * FROM budget_categories WHERE month_id = ? ORDER BY order_index',
      [monthId]
    );

    res.json(categories.map(c => ({
      ...c,
      allocated_amount: c.allocated_amount / 100
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/:id/transactions - Get all transactions for a category
router.get('/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await dbGet('SELECT * FROM budget_categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({ error: 'Budget category not found' });
    }

    const transactions = await dbAll(
      'SELECT * FROM transactions WHERE category_id = ? ORDER BY transaction_date DESC, created_at DESC',
      [id]
    );

    res.json(transactions.map(t => ({
      ...t,
      amount: t.amount / 100
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
