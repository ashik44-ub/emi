/**
 * Formats a number with commas as thousands separators.
 * @param {number|string} num - The number to format.
 * @returns {string} - The formatted number.
 */
export const formatCurrency = (num) => {
  if (num === undefined || num === null || num === '-') return num;
  const n = Number(num);
  if (isNaN(n)) return num;
  return n.toLocaleString('en-IN'); // Using en-IN for Indian/Bangladeshi numbering system if preferred, or en-US for standard.
};
