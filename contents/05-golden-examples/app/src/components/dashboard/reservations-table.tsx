"use client";

import { Archive, CaretDown, CaretUp } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useDesign } from "@/components/patterns/design-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StringKey } from "@/lib/i18n";
import type { Reservation, ReservationStatus } from "@/lib/dashboard-data";
import { fade } from "@/lib/motion";

type Col = "guest" | "suite" | "status" | "amount" | "day";
const STATUS_ORDER: Record<ReservationStatus, number> = { arrived: 0, confirmed: 1, pending: 2 };
const STATUS_TONE = { confirmed: "success", pending: "warning", arrived: "info" } as const;
const STATUS_KEY: Record<ReservationStatus, StringKey> = { confirmed: "dashConfirmed", pending: "dashPending", arrived: "dashArrived" };

export function ReservationsTable({ rows, onArchive, onRestoreAll }: { rows: readonly Reservation[]; onArchive: (r: Reservation) => void; onRestoreAll: () => void }) {
  const { t, tl, locale, motionOk } = useDesign();
  const [sort, setSort] = useState<{ col: Col; dir: "asc" | "desc" }>({ col: "day", dir: "asc" });
  const guests = tl("dashGuests");
  const suites = tl("dashSuites");
  const money = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }), [locale]);
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }), [locale]);
  const today = useMemo(() => new Date(), []);
  const dateOf = (day: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + day);
    return dateFmt.format(d);
  };

  const sorted = useMemo(() => {
    const val = (r: Reservation): string | number => {
      switch (sort.col) {
        case "guest": return guests[r.guest] ?? "";
        case "suite": return suites[r.suite] ?? "";
        case "status": return STATUS_ORDER[r.status];
        case "amount": return r.amount;
        default: return r.day;
      }
    };
    const k = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      return (typeof va === "string" ? va.localeCompare(String(vb), locale) : va - (vb as number)) * k;
    });
  }, [rows, sort, guests, suites, locale]);

  const head = (col: Col, label: string, align: "start" | "end" = "start") => {
    const on = sort.col === col;
    const Icon = on && sort.dir === "desc" ? CaretDown : CaretUp;
    return (
      <th scope="col" aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className="p-0 font-normal">
        <button
          type="button"
          aria-label={t("dashSort", { col: label })}
          onClick={() => setSort((s) => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }))}
          className={`flex min-h-touch w-full items-center gap-1 px-3 text-sm text-ink-2 hover:text-ink ${align === "end" ? "justify-end" : "justify-start"}`}
        >
          {label}
          <Icon aria-hidden size={12} weight="bold" className={on ? "text-brand-text" : "opacity-0"} />
        </button>
      </th>
    );
  };

  if (rows.length === 0) {
    return (
      <div className="grid justify-items-center gap-3 py-section-sm text-center">
        <p className="font-display text-2xl">{t("dashEmptyTitle")}</p>
        <p className="max-w-reading text-ink-2">{t("dashEmptyBody")}</p>
        <Button variant="quiet" onClick={onRestoreAll}>
          {t("dashRestoreAll")}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-start">
        <caption className="sr-only">{t("dashTableTitle")}</caption>
        <thead>
          <tr className="border-b border-hairline">
            {head("guest", t("dashColGuest"))}
            {head("suite", t("dashColSuite"))}
            {head("status", t("dashColStatus"))}
            {head("amount", t("dashColAmount"), "end")}
            {head("day", t("dashColDate"))}
            <th scope="col" className="w-16 p-0">
              <span className="sr-only">{t("dashArchive")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {sorted.map((r) => {
              const guest = guests[r.guest] ?? "";
              return (
                <motion.tr
                  key={r.id}
                  layout={motionOk ? "position" : false}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                  className="border-b border-hairline last:border-b-0"
                >
                  <th scope="row" className="px-3 py-3 text-start font-medium text-ink">{guest}</th>
                  <td className="px-3 py-3 text-ink-2">{suites[r.suite]}</td>
                  <td className="px-3 py-3">
                    <Badge tone={STATUS_TONE[r.status]}>{t(STATUS_KEY[r.status])}</Badge>
                  </td>
                  <td className="px-3 py-3 text-end tabular-nums text-ink">{money.format(r.amount)}</td>
                  <td className="px-3 py-3 text-ink-2">{dateOf(r.day)}</td>
                  <td className="px-1 py-1 text-end">
                    <Button variant="ghost" size="icon" aria-label={`${t("dashArchive")}: ${guest}`} onClick={() => onArchive(r)}>
                      <Archive aria-hidden size={20} weight="light" />
                    </Button>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
