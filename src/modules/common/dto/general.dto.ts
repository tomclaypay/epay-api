export enum TransactionType {
  Debit = 'DEBIT',
  Credit = 'CREDIT'
}

export enum OrderStatus {
  Pending = 'PENDING',
  Verifying = 'VERIFYING',
  Succeed = 'SUCCEED',
  Canceled = 'CANCELED',
  Failed = 'FAILED'
}

export enum DepositOrderType {
  BANK = 'BANK',
  CARD = 'CARD',
  VIRTUAL = 'VIRTUAL',
  CRYPTO = 'CRYPTO'
}
