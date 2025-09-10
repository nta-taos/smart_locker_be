export enum PaymentStatus {
  UNPAID = 0,
  PAID = 1
}

export enum OrderType {
  USER_IN_BUILDING = 0,
  USER_OUT_BUILDING = 1,
  SHIPPER_TO_USER_IN_BUILDING = 2,
  SHIPPER_TO_USER_OUT_BUILDING = 3,
  SHIPPER_TO_GUEST = 4
}

export enum OrderStatus {
  PENDING = 0,
  SENDING = 1,
  RECEIVED = 2,
  EXPIRED = 3
}
