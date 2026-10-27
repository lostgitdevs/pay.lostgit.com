import { describe, it, expect } from 'vitest';
import {
  calculateLineItemTotal,
  calculateInvoiceTotals,
  generateInstalmentSchedule,
  calculateBalance,
} from '../lib/calculations';

describe('Financial Calculations Engine', () => {
  describe('calculateLineItemTotal', () => {
    it('calculates total correctly in paise', () => {
      expect(calculateLineItemTotal(2, 50000)).toBe(100000);
      expect(calculateLineItemTotal(1.5, 30000)).toBe(45000);
    });

    it('throws error on negative values', () => {
      expect(() => calculateLineItemTotal(-1, 1000)).toThrow();
      expect(() => calculateLineItemTotal(1, -1000)).toThrow();
    });
  });

  describe('calculateInvoiceTotals', () => {
    it('calculates 18% GST correctly on subtotal', () => {
      const result = calculateInvoiceTotals({
        items: [
          { quantity: 1, unitPricePaise: 1000000 }, // Rs. 10,000.00
        ],
        taxRatePercent: 18,
        discountAmountPaise: 0,
      });

      expect(result.subtotalPaise).toBe(1000000);
      expect(result.discountAmountPaise).toBe(0);
      expect(result.taxableAmountPaise).toBe(1000000);
      expect(result.taxAmountPaise).toBe(180000); // Rs. 1,800.00
      expect(result.totalAmountPaise).toBe(1180000); // Rs. 11,800.00
    });

    it('applies discount before calculating tax', () => {
      const result = calculateInvoiceTotals({
        items: [
          { quantity: 1, unitPricePaise: 1000000 }, // Rs. 10,000.00
        ],
        taxRatePercent: 18,
        discountAmountPaise: 200000, // Rs. 2,000.00 discount
      });

      expect(result.subtotalPaise).toBe(1000000);
      expect(result.discountAmountPaise).toBe(200000);
      expect(result.taxableAmountPaise).toBe(800000); // Rs. 8,000.00
      expect(result.taxAmountPaise).toBe(144000); // 18% of 8,000 = Rs. 1,440.00
      expect(result.totalAmountPaise).toBe(944000); // Rs. 9,440.00
    });

    it('caps discount if discount exceeds subtotal', () => {
      const result = calculateInvoiceTotals({
        items: [{ quantity: 1, unitPricePaise: 50000 }],
        taxRatePercent: 18,
        discountAmountPaise: 100000,
      });

      expect(result.subtotalPaise).toBe(50000);
      expect(result.discountAmountPaise).toBe(50000);
      expect(result.taxableAmountPaise).toBe(0);
      expect(result.taxAmountPaise).toBe(0);
      expect(result.totalAmountPaise).toBe(0);
    });
  });

  describe('generateInstalmentSchedule', () => {
    it('guarantees zero rounding error across uneven split (e.g. 10,000 paise / 3 instalments)', () => {
      const totalAmountPaise = 10000; // 100.00 INR
      const numberOfInstalments = 3;
      const startDate = new Date('2026-11-01');

      const schedule = generateInstalmentSchedule({
        totalAmountPaise,
        numberOfInstalments,
        startDate,
        frequency: 'monthly',
      });

      expect(schedule).toHaveLength(3);
      // 10000 / 3 = 3333 with remainder 1
      expect(schedule[0].amountPaise).toBe(3334);
      expect(schedule[1].amountPaise).toBe(3333);
      expect(schedule[2].amountPaise).toBe(3333);

      // CRITICAL FINTECH ASSERTION: Total must equal sum of parts exactly
      const sum = schedule.reduce((acc, curr) => acc + curr.amountPaise, 0);
      expect(sum).toBe(totalAmountPaise);
    });

    it('computes correct monthly due dates', () => {
      const schedule = generateInstalmentSchedule({
        totalAmountPaise: 300000,
        numberOfInstalments: 3,
        startDate: new Date(2026, 0, 15), // Jan 15, 2026
        frequency: 'monthly',
      });

      expect(schedule[0].dueDate.getMonth()).toBe(0); // January
      expect(schedule[1].dueDate.getMonth()).toBe(1); // February
      expect(schedule[2].dueDate.getMonth()).toBe(2); // March
    });
  });

  describe('calculateBalance', () => {
    it('accurately computes balance and status', () => {
      expect(calculateBalance(100000, 40000)).toEqual({
        remainingPaise: 60000,
        isFullyPaid: false,
        percentagePaid: 40,
      });

      expect(calculateBalance(100000, 100000)).toEqual({
        remainingPaise: 0,
        isFullyPaid: true,
        percentagePaid: 100,
      });

      expect(calculateBalance(100000, 120000)).toEqual({
        remainingPaise: 0,
        isFullyPaid: true,
        percentagePaid: 100,
      });
    });
  });
});
