
import { Transaction, CreditCard, MonthlyProjection, ProjectionDetail } from '../types';

export const getBillingDate = (dateStr: string, closingDay: number, dueDay: number): Date => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();
  const closingDate = new Date(year, month, closingDay);
  
  let billingMonth = month;
  let billingYear = year;

  if (date >= closingDate) {
    billingMonth += 1;
    if (billingMonth > 11) {
      billingMonth = 0;
      billingYear += 1;
    }
  }

  return new Date(billingYear, billingMonth, dueDay);
};

export const calculate12MonthProjection = (
  cards: CreditCard[],
  transactions: Transaction[]
): MonthlyProjection[] => {
  const projection: MonthlyProjection[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  for (let i = 0; i < 12; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthLabel = targetDate.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
    const isCurrent = targetDate.getMonth() === currentMonth && targetDate.getFullYear() === currentYear;
    
    const monthObj: MonthlyProjection = {
      month: monthLabel,
      fullDate: new Date(targetDate),
      total: 0,
      isCurrentMonth: isCurrent
    };

    cards.forEach(c => {
      monthObj[c.id] = 0;
    });

    transactions.forEach(t => {
      const card = cards.find(c => c.id === t.cardId);
      if (!card) return;

      const firstBill = getBillingDate(t.date, card.closingDay, card.dueDay);
      const installmentValue = t.value / t.installments;

      if (t.isRecurring) {
        // Se é recorrente, aparece em todos os meses a partir do primeiro faturamento
        const firstBillStart = new Date(firstBill.getFullYear(), firstBill.getMonth(), 1);
        if (targetDate >= firstBillStart) {
          monthObj[t.cardId] = (monthObj[t.cardId] || 0) + t.value;
          monthObj.total += t.value;
        }
      } else {
        // Lógica normal de parcelamento
        for (let inst = 0; inst < t.installments; inst++) {
          const installmentDate = new Date(firstBill.getFullYear(), firstBill.getMonth() + inst, 1);
          if (
            installmentDate.getFullYear() === targetDate.getFullYear() &&
            installmentDate.getMonth() === targetDate.getMonth()
          ) {
            monthObj[t.cardId] = (monthObj[t.cardId] || 0) + installmentValue;
            monthObj.total += installmentValue;
          }
        }
      }
    });

    cards.forEach(c => {
      monthObj[c.id] = parseFloat(monthObj[c.id].toFixed(2));
    });
    monthObj.total = parseFloat(monthObj.total.toFixed(2));
    projection.push(monthObj);
  }

  return projection;
};

export const getMonthlyDetails = (
  targetDate: Date,
  cards: CreditCard[],
  transactions: Transaction[]
): ProjectionDetail[] => {
  const details: ProjectionDetail[] = [];
  
  transactions.forEach(t => {
    const card = cards.find(c => c.id === t.cardId);
    if (!card) return;

    const firstBill = getBillingDate(t.date, card.closingDay, card.dueDay);
    const installmentValue = t.value / t.installments;

    if (t.isRecurring) {
      const firstBillStart = new Date(firstBill.getFullYear(), firstBill.getMonth(), 1);
      if (targetDate >= firstBillStart) {
        details.push({
          description: t.description,
          cardName: card.name,
          cardColor: card.color,
          installmentNumber: 1,
          totalInstallments: 1,
          value: t.value,
          isRecurring: true
        });
      }
    } else {
      for (let inst = 0; inst < t.installments; inst++) {
        const installmentDate = new Date(firstBill.getFullYear(), firstBill.getMonth() + inst, 1);
        if (
          installmentDate.getFullYear() === targetDate.getFullYear() &&
          installmentDate.getMonth() === targetDate.getMonth()
        ) {
          details.push({
            description: t.description,
            cardName: card.name,
            cardColor: card.color,
            installmentNumber: inst + 1,
            totalInstallments: t.installments,
            value: installmentValue,
            isRecurring: false
          });
        }
      }
    }
  });

  return details.sort((a, b) => b.value - a.value);
};

export const calculateUsedLimit = (cardId: string, transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.cardId === cardId)
    .reduce((acc, t) => acc + (t.isRecurring ? t.value : t.value), 0);
};

export const formatCurrency = (value: number, isPrivate: boolean = false) => {
  if (isPrivate) return 'R$ ••••••';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const getInvoiceStatus = (closingDay: number): { label: string, color: string } => {
  const now = new Date();
  const day = now.getDate();
  if (day < closingDay) return { label: 'Aberta', color: 'bg-emerald-500' };
  return { label: 'Fechada', color: 'bg-amber-500' };
};
