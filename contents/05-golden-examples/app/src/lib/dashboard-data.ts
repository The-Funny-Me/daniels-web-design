export type ReservationStatus = "confirmed" | "pending" | "arrived";

export interface Reservation {
  id: string;
  /** index into the localized guests / suites lists */
  guest: number;
  suite: number;
  status: ReservationStatus;
  amount: number;
  /** days from today (negative = past) */
  day: number;
}

export interface DashboardData {
  stats: { revenue: number; bookings: number; occupancy: number; returning: number; deltas: [number, number, number, number] };
  thisYear: readonly number[];
  lastYear: readonly number[];
  reservations: readonly Reservation[];
}

const reservations: readonly Reservation[] = [
  { id: "r1", guest: 0, suite: 0, status: "confirmed", amount: 2480, day: 1 },
  { id: "r2", guest: 1, suite: 1, status: "arrived", amount: 1920, day: 0 },
  { id: "r3", guest: 2, suite: 2, status: "pending", amount: 3150, day: 3 },
  { id: "r4", guest: 3, suite: 3, status: "confirmed", amount: 1240, day: 2 },
  { id: "r5", guest: 4, suite: 0, status: "arrived", amount: 2760, day: -1 },
  { id: "r6", guest: 5, suite: 1, status: "pending", amount: 1680, day: 5 },
  { id: "r7", guest: 6, suite: 2, status: "confirmed", amount: 2890, day: 4 },
  { id: "r8", guest: 7, suite: 3, status: "confirmed", amount: 1450, day: 6 },
];

const data: DashboardData = {
  stats: { revenue: 128400, bookings: 342, occupancy: 87, returning: 61, deltas: [12.4, 8.1, 3.2, 5.6] },
  thisYear: [214, 226, 231, 240, 237, 256, 263, 271, 284, 291, 318, 304],
  lastYear: [188, 192, 205, 201, 214, 219, 224, 231, 240, 246, 252, 258],
  reservations,
};

export interface LoadOptions {
  slow: boolean;
  fail: boolean;
}

/** Simulated fetch. `slow` crosses the adaptive-loading threshold; `fail` rejects once so Retry can recover. */
export function loadDashboard({ slow, fail }: LoadOptions): Promise<DashboardData> {
  return new Promise((resolve, reject) => {
    setTimeout(() => (fail ? reject(new Error("simulated failure")) : resolve(data)), slow ? 1800 : fail ? 400 : 120);
  });
}
