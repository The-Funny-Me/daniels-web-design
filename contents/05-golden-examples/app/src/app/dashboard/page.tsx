"use client";

import { ArrowClockwise, ChartLineUp, Gear, SquaresFour, Table as TableIcon, ChartLine, UsersThree } from "@phosphor-icons/react";
import { useMemo, useRef, useState } from "react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { LineChart } from "@/components/dashboard/line-chart";
import { ReservationsTable } from "@/components/dashboard/reservations-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { BrandMark } from "@/components/patterns/brand-mark";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { useDesign } from "@/components/patterns/design-provider";
import { Eyebrow } from "@/components/patterns/eyebrow";
import { LoadingGate } from "@/components/patterns/loading-gate";
import { GlassSheet } from "@/components/patterns/overlay";
import { RegionBoundary, RegionError } from "@/components/patterns/region-error";
import { Reveal } from "@/components/patterns/reveal";
import { noticeToast, undoToast } from "@/components/patterns/toaster";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAdaptiveLoading } from "@/hooks/use-adaptive-loading";
import { loadDashboard, type Reservation } from "@/lib/dashboard-data";
import { durations } from "@/lib/motion";

export default function DashboardPage() {
  const { t, locale } = useDesign();
  const [slow, setSlow] = useState(false);
  const [fail, setFail] = useState(false);
  const flags = useRef({ slow, fail });
  flags.current = { slow, fail };

  const { phase, data, reload } = useAdaptiveLoading(() => {
    const f = flags.current;
    if (f.fail) setFail(false); // one-shot: Retry then succeeds
    return loadDashboard(f);
  });

  const [archived, setArchived] = useState<ReadonlySet<string>>(new Set());
  const [tableView, setTableView] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const rows = useMemo(() => (data ? data.reservations.filter((r) => !archived.has(r.id)) : []), [data, archived]);

  const archive = (r: Reservation) => {
    setArchived((s) => new Set(s).add(r.id));
    undoToast({
      message: t("dashArchived"),
      undoLabel: t("undo"),
      closeLabel: t("close"),
      onUndo: () =>
        setArchived((s) => {
          const next = new Set(s);
          next.delete(r.id);
          return next;
        }),
    });
  };

  const openDelete = () => {
    setSettingsOpen(false);
    setTimeout(() => setDeleteOpen(true), durations.slow * 1000);
  };

  const num = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const money = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }), [locale]);
  const pct = useMemo(() => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }), [locale]);
  const delta = useMemo(() => new Intl.NumberFormat(locale, { style: "percent", signDisplay: "always", maximumFractionDigits: 1 }), [locale]);

  const nav = [
    { icon: SquaresFour, label: t("dashNavOverview"), current: true },
    { icon: ChartLineUp, label: t("dashNavReports"), current: false },
    { icon: UsersThree, label: t("dashNavGuests"), current: false },
  ];

  const series = data
    ? [
        { id: "last", name: t("dashChartLast"), values: data.lastYear, emphasis: false },
        { id: "this", name: t("dashChartThis"), values: data.thisYear, emphasis: true },
      ]
    : [];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-e border-hairline bg-surface p-6 lg:flex">
        <div className="flex items-center gap-3">
          <BrandMark className="size-8" />
          <span className="font-display text-2xl">{t("brand")}</span>
        </div>
        <nav aria-label={t("dashNavLabel")} className="grid gap-1">
          {nav.map((n) => (
            <a
              key={n.label}
              href="#main"
              aria-current={n.current ? "page" : undefined}
              className={`lift-sm lift flex min-h-touch items-center gap-3 rounded-pill px-4 text-sm ${n.current ? "bg-surface-raised text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`}
            >
              <n.icon aria-hidden size={20} weight="thin" className={n.current ? "text-brand-text" : undefined} />
              {n.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="lift flex min-h-touch items-center gap-3 rounded-pill px-4 text-start text-sm text-ink-2 hover:text-ink"
          >
            <Gear aria-hidden size={20} weight="thin" />
            {t("dashNavSettings")}
          </button>
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="glass sticky top-0 z-(--ds-z-nav) flex items-center justify-between gap-3 rounded-none border-0 border-b px-(--ds-gutter) py-2 shadow-none">
          <div className="flex items-center gap-3 lg:hidden">
            <BrandMark className="size-8" />
            <span className="font-display text-2xl">{t("brand")}</span>
          </div>
          <div className="hidden lg:block">
            <Eyebrow>{t("dashNavOverview")}</Eyebrow>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={reload}>
              <ArrowClockwise aria-hidden size={16} weight="light" />
              {t("dashReload")}
            </Button>
            <Button variant="ghost" size="icon" aria-label={t("dashSettings")} onClick={() => setSettingsOpen(true)}>
              <Gear aria-hidden size={20} weight="light" />
            </Button>
          </div>
        </header>

        <main id="main" className="mx-auto grid max-w-app grid-cols-[minmax(0,1fr)] gap-(--ds-grid-gap) px-(--ds-gutter) py-section-sm">
          <LoadingGate phase={phase} onRetry={reload} compact>
            {data && (
              <>
                <Reveal className="grid gap-2">
                  <h1 className="font-display text-4xl leading-display tracking-display">{t("dashGreeting")}</h1>
                  <p className="text-lg text-ink-2">{t("dashSub")}</p>
                </Reveal>

                <Reveal index={1} className="flex flex-wrap gap-x-6">
                  <Switch checked={slow} onCheckedChange={setSlow} label={t("dashSlow")} />
                  <Switch checked={fail} onCheckedChange={setFail} label={t("dashFail")} />
                </Reveal>

                <ul className="grid grid-cols-2 gap-(--ds-grid-gap) lg:grid-cols-4">
                  {[
                    { label: t("dashRevenue"), value: money.format(data.stats.revenue) },
                    { label: t("dashBookings"), value: num.format(data.stats.bookings) },
                    { label: t("dashOccupancy"), value: pct.format(data.stats.occupancy / 100) },
                    { label: t("dashReturning"), value: pct.format(data.stats.returning / 100) },
                  ].map((s, i) => (
                    <Reveal as="li" key={s.label} index={i + 2}>
                      <StatCard label={s.label} value={s.value} delta={delta.format((data.stats.deltas[i] ?? 0) / 100)} deltaLabel={t("dashVsLast")} />
                    </Reveal>
                  ))}
                </ul>

                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-(--ds-grid-gap) lg:grid-cols-3">
                  <Reveal index={6} className="min-w-0 lg:col-span-2">
                    <Card className="grid h-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-display text-2xl">{t("dashChartTitle")}</h2>
                        <Button variant="ghost" size="sm" onClick={() => setTableView((v) => !v)} aria-pressed={tableView}>
                          {tableView ? <ChartLine aria-hidden size={16} weight="light" /> : <TableIcon aria-hidden size={16} weight="light" />}
                          {tableView ? t("dashViewChart") : t("dashViewTable")}
                        </Button>
                      </div>
                      <RegionBoundary fallback={(reset) => <RegionError onRetry={() => { setFail(false); reset(); }} />}>
                        {fail ? (
                          <RegionError onRetry={() => setFail(false)} />
                        ) : tableView ? (
                          <div className="relative overflow-x-auto">
                            <table className="w-full border-collapse text-start tabular-nums">
                              <caption className="sr-only">{t("dashChartTitle")}</caption>
                              <thead>
                                <tr className="border-b border-hairline text-sm text-ink-2">
                                  <th scope="col" className="px-3 py-2 text-start font-normal"> </th>
                                  <th scope="col" className="px-3 py-2 text-end font-normal">{t("dashChartThis")}</th>
                                  <th scope="col" className="px-3 py-2 text-end font-normal">{t("dashChartLast")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.thisYear.map((v, i) => (
                                  <tr key={i} className="border-b border-hairline last:border-b-0">
                                    <th scope="row" className="px-3 py-2 text-start font-normal text-ink-2">{t("dashWeek", { n: i + 1 })}</th>
                                    <td className="px-3 py-2 text-end text-ink">{num.format(v)}</td>
                                    <td className="px-3 py-2 text-end text-ink-2">{num.format(data.lastYear[i] ?? 0)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <LineChart
                            series={series}
                            tick={(i) => t("dashWeekShort", { n: i + 1 })}
                            heading={(i) => t("dashWeek", { n: i + 1 })}
                            announce={(i) => t("dashChartPoint", { n: i + 1, a: num.format(data.thisYear[i] ?? 0), b: num.format(data.lastYear[i] ?? 0) })}
                            describe={t("dashChartDesc")}
                          />
                        )}
                      </RegionBoundary>
                    </Card>
                  </Reveal>
                  <Reveal index={7} className="min-w-0">
                    <Card className="grid h-full min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-4 p-6">
                      <h2 className="font-display text-2xl">{t("dashActivity")}</h2>
                      <RegionBoundary fallback={(reset) => <RegionError onRetry={reset} />}>
                        <ActivityFeed />
                      </RegionBoundary>
                    </Card>
                  </Reveal>
                </div>

                <Reveal index={8} className="min-w-0">
                  <Card className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 p-6">
                    <h2 className="font-display text-2xl">{t("dashTableTitle")}</h2>
                    <RegionBoundary fallback={(reset) => <RegionError onRetry={reset} />}>
                      <ReservationsTable rows={rows} onArchive={archive} onRestoreAll={() => setArchived(new Set())} />
                    </RegionBoundary>
                  </Card>
                </Reveal>

                <p className="text-sm text-ink-2">{t("dashFootnote")}</p>
              </>
            )}
          </LoadingGate>
        </main>
      </div>

      <GlassSheet open={settingsOpen} onOpenChange={setSettingsOpen} title={t("dashSettings")} description={t("dashSettingsBody")}>
        <div className="grid gap-4">
          <Eyebrow>{t("dashSettingsLabel")}</Eyebrow>
          <Button variant="danger" onClick={openDelete}>
            {t("dashDeleteWs")}
          </Button>
        </div>
      </GlassSheet>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("dashDelTitle")}
        description={t("dashDelBody")}
        confirmLabel={t("dashDelConfirm")}
        phrase={t("dashDelPhrase")}
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 600));
          noticeToast(t("dashDeleted"));
        }}
      />
    </div>
  );
}
