export const transactions = {
  title: 'Transactions',
  columns: { date: 'Date', type: 'Type', amount: 'Amount', ref: 'Reference' },
  filters: ['All', 'Invoice', 'Receipt', 'Refund'],
  actions: { raiseTicket: 'Raise Ticket' },
  empty: 'No transactions found.',
};
