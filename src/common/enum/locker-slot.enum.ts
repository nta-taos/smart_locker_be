export enum SlotSize {
  SMALL = 0,
  MEDIUM = 1,
  LARGE = 2,
  XL = 3
}

export enum SlotStatus {
  EMPTY = 0,
  RESERVED = 1,
  OCCUPIED = 2,
  MAINTENANCE = 3
}

export const SlotPricePerTime: Record<SlotSize, number> = {
  [SlotSize.SMALL]: 800,
  [SlotSize.MEDIUM]: 1000,
  [SlotSize.LARGE]: 1200,
  [SlotSize.XL]: 1900
}
