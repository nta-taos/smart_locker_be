export enum SlotSize {
  SMALL = 0,
  MEDIUM = 1,
  LARGE = 2
}

export enum SlotStatus {
  EMPTY = 0,
  RESERVED = 1,
  OCCUPIED = 2,
  MAINTENANCE = 3
}

export const SlotPricePerTime: Record<SlotSize, number> = {
  [SlotSize.SMALL]: 400,
  [SlotSize.MEDIUM]: 600,
  [SlotSize.LARGE]: 800
}
