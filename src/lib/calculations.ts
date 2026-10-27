import { addDays, addMonths, addWeeks } from 'date-fns';

export interface LineItemInput {
  quantity: number;
  unitPricePaise: number;
}

export interface InvoiceTotals {
  subtotalPaise: number;
  discountAmountPaise: number;
  taxableAmountPaise: number;
  taxRatePercent: number;
  taxAmountPaise: number;
  totalAmountPaise: number;
}

export interface InstalmentScheduleItem {
  instalmentNumber: number;
  amountPaise: number;
  dueDate: Date;
}

export type ScheduleFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

/**
 * Calculates line item total in paise.
 * Quantity can be decimal (e.g. 2.5 hours), but unit price and result are integer paise.
 */
export function calculateLineItemTotal(quantity: number, unitPricePaise: number): number {
  if (quantity < 0 || unitPricePaise < 0) {
    throw new Error('Quantity and unit price cannot be negative');
  }
  return Math.round(quantity * unitPricePaise);
}

/**
 * Calculates accurate invoice totals in integer paise.
 * Applies discount to subtotal before calculating percentage tax.
 */
export function calculateInvoiceTotals({
  items,
  taxRatePercent = 18.0,
  discountAmountPaise = 0,
}: {
  items: LineItemInput[];
  taxRatePercent?: number;
  discountAmountPaise?: number;
}): InvoiceTotals {
  if (taxRatePercent < 0) {
    throw new Error('Tax rate cannot be negative');
  }
  if (discountAmountPaise < 0) {
    throw new Error('Discount amount cannot be negative');
  }

  const subtotalPaise = items.reduce(
    (sum, item) => sum + calculateLineItemTotal(item.quantity, item.unitPricePaise),
    0
  );

  const safeDiscount = Math.min(discountAmountPaise, subtotalPaise);
  const taxableAmountPaise = subtotalPaise - safeDiscount;

  // Compute tax paise with standard rounding
  const taxAmountPaise = Math.round((taxableAmountPaise * taxRatePercent) / 100);
  const totalAmountPaise = taxableAmountPaise + taxAmountPaise;

  return {
    subtotalPaise,
    discountAmountPaise: safeDiscount,
    taxableAmountPaise,
    taxRatePercent,
    taxAmountPaise,
    totalAmountPaise,
  };
}

/**
 * Generates an instalment schedule that guarantees:
 * 1. Sum of all instalments equals totalAmountPaise exactly (zero rounding loss).
 * 2. Proper due dates according to the chosen schedule frequency.
 */
export function generateInstalmentSchedule({
  totalAmountPaise,
  numberOfInstalments,
  startDate,
  frequency = 'monthly',
}: {
  totalAmountPaise: number;
  numberOfInstalments: number;
  startDate: Date;
  frequency?: ScheduleFrequency;
}): InstalmentScheduleItem[] {
  if (totalAmountPaise <= 0) {
    throw new Error('Total amount must be greater than zero');
  }
  if (numberOfInstalments < 1) {
    throw new Error('Number of instalments must be at least 1');
  }

  const baseAmount = Math.floor(totalAmountPaise / numberOfInstalments);
  const remainderPaise = totalAmountPaise - baseAmount * numberOfInstalments;

  const schedule: InstalmentScheduleItem[] = [];

  for (let i = 1; i <= numberOfInstalments; i++) {
    // Distribute remainder paise to the first instalment
    const amountPaise = i === 1 ? baseAmount + remainderPaise : baseAmount;

    let dueDate: Date;
    switch (frequency) {
      case 'weekly':
        dueDate = addWeeks(startDate, i - 1);
        break;
      case 'biweekly':
        dueDate = addWeeks(startDate, (i - 1) * 2);
        break;
      case 'quarterly':
        dueDate = addMonths(startDate, (i - 1) * 3);
        break;
      case 'monthly':
      default:
        dueDate = addMonths(startDate, i - 1);
        break;
    }

    schedule.push({
      instalmentNumber: i,
      amountPaise,
      dueDate,
    });
  }

  return schedule;
}

/**
 * Calculates remaining balance and completion percentage.
 */
export function calculateBalance(
  totalAmountPaise: number,
  amountPaidPaise: number
): {
  remainingPaise: number;
  isFullyPaid: boolean;
  percentagePaid: number;
} {
  const safePaid = Math.max(0, amountPaidPaise);
  const remainingPaise = Math.max(0, totalAmountPaise - safePaid);
  const isFullyPaid = remainingPaise === 0 && totalAmountPaise > 0;
  const percentagePaid = totalAmountPaise > 0
    ? Math.min(100, Math.round((safePaid / totalAmountPaise) * 100))
    : 0;

  return {
    remainingPaise,
    isFullyPaid,
    percentagePaid,
  };
}
