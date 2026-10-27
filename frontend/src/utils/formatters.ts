export const formatINR = (amount: number): string => {
  if (isNaN(amount)) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
};

export const formatLakh = (amount: number): string => {
  if (isNaN(amount)) return '₹0';
  if (amount >= 100000) {
    const inLakhs = (amount / 100000).toFixed(2);
    return `₹${inLakhs}L`;
  }
  return formatINR(amount);
};

export const getFairnessBadgeColor = (category: string) => {
  switch (category) {
    case 'Below Benchmark':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        text: 'Bargain Deal',
      };
    case 'Near Benchmark':
      return {
        bg: 'bg-sky-50 text-sky-700 border-sky-200',
        dot: 'bg-sky-500',
        text: 'Fair Price',
      };
    case 'Above Benchmark':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        text: 'Premium Overpriced',
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        text: 'Standard',
      };
  }
};
