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

// POST /api/categories/:categoryId/transactions - Create transaction
router.post('/categories/:categoryId/transactions', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { amount, description, transaction_date } = req.body;

    if (amount === undefined) {
      return res.status(400).json({ error: 'amount is required' });
    }

    // Check if category exists
    const category = await dbGet('SELECT id FROM budget_categories WHERE id = ?', [categoryId]);
    if (!category) {
      return res.status(404).json({ error: 'Budget category not found' });
    }

    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);

    // Use provided date or current date
    const date = transaction_date || new Date().toISOString().split('T')[0];

    const result = await dbRun(
      'INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [categoryId, amountInCents, description || null, date]
    );

    const newTransaction = await dbGet('SELECT * FROM transactions WHERE id = ?', [result.id]);
    res.status(201).json({
      ...newTransaction,
      amount: newTransaction.amount / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, transaction_date } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(Math.round(amount * 100));
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description || null);
    }

    if (transaction_date !== undefined) {
      updates.push('transaction_date = ?');
      params.push(transaction_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    const result = await dbRun(
      `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updatedTransaction = await dbGet('SELECT * FROM transactions WHERE id = ?', [id]);
    res.json({
      ...updatedTransaction,
      amount: updatedTransaction.amount / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dbRun('DELETE FROM transactions WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
