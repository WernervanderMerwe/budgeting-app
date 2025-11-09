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

// POST /api/months/:monthId/fixed-payments - Create fixed payment
router.post('/months/:monthId/fixed-payments', async (req, res) => {
  try {
    const { monthId } = req.params;
    const { name, amount, order_index } = req.body;

    if (!name || amount === undefined) {
      return res.status(400).json({ error: 'name and amount are required' });
    }

    // Check if month exists
    const month = await dbGet('SELECT id FROM months WHERE id = ?', [monthId]);
    if (!month) {
      return res.status(404).json({ error: 'Month not found' });
    }

    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);

    // Get next order_index if not provided
    let orderIndex = order_index;
    if (orderIndex === undefined) {
      const maxOrderResult = await dbGet(
        'SELECT MAX(order_index) as max_order FROM fixed_payments WHERE month_id = ?',
        [monthId]
      );
      orderIndex = (maxOrderResult.max_order || -1) + 1;
    }

    const result = await dbRun(
      'INSERT INTO fixed_payments (month_id, name, amount, order_index) VALUES (?, ?, ?, ?)',
      [monthId, name, amountInCents, orderIndex]
    );

    const newPayment = await dbGet('SELECT * FROM fixed_payments WHERE id = ?', [result.id]);
    res.status(201).json({
      ...newPayment,
      amount: newPayment.amount / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/fixed-payments/:id - Update fixed payment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(Math.round(amount * 100));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    const result = await dbRun(
      `UPDATE fixed_payments SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Fixed payment not found' });
    }

    const updatedPayment = await dbGet('SELECT * FROM fixed_payments WHERE id = ?', [id]);
    res.json({
      ...updatedPayment,
      amount: updatedPayment.amount / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/fixed-payments/:id - Delete fixed payment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dbRun('DELETE FROM fixed_payments WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Fixed payment not found' });
    }

    res.json({ message: 'Fixed payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/months/:monthId/fixed-payments/reorder - Reorder fixed payments
router.put('/months/:monthId/fixed-payments/reorder', async (req, res) => {
  try {
    const { monthId } = req.params;
    const { paymentIds } = req.body; // Array of IDs in desired order

    if (!Array.isArray(paymentIds)) {
      return res.status(400).json({ error: 'paymentIds must be an array' });
    }

    // Update order_index for each payment
    for (let i = 0; i < paymentIds.length; i++) {
      await dbRun(
        'UPDATE fixed_payments SET order_index = ? WHERE id = ? AND month_id = ?',
        [i, paymentIds[i], monthId]
      );
    }

    // Return updated list
    const payments = await dbAll(
      'SELECT * FROM fixed_payments WHERE month_id = ? ORDER BY order_index',
      [monthId]
    );

    res.json(payments.map(p => ({
      ...p,
      amount: p.amount / 100
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
