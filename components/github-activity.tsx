"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import activity from "@/data/github-activity.json";

const LEVEL_COLORS = [
  "bg-neutral-200/70 dark:bg-neutral-800",
  "bg-[#9be9a8] dark:bg-[#0e4429]",
  "bg-[#40c463] dark:bg-[#006d32]",
  "bg-[#30a14e] dark:bg-[#26a641]",
  "bg-[#216e39] dark:bg-[#39d353]",
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const { days } = activity;
const startOffset = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
const weekCount = Math.ceil((startOffset + days.length) / 7);
const cells = Array.from({ length: weekCount * 7 }, (_, index) => days[index - startOffset] ?? null);
const months = days.flatMap((day, index) => {
  if (index !== 0 && !day.date.endsWith("-01")) return [];
  const column = Math.floor((index + startOffset) / 7);
  // Leave room for the final month label when only a partial week is visible.
  if (index !== 0 && column > weekCount - 3) return [];
  return [{ date: day.date, column, label: monthFormatter.format(new Date(`${day.date}T00:00:00Z`)) }];
});

function dayLabel(index: number) {
  const day = days[index];
  const count = day.count === 0 ? "No contributions" : `${day.count} contribution${day.count === 1 ? "" : "s"}`;
  return `${count} on ${dateFormatter.format(new Date(`${day.date}T00:00:00Z`))}`;
}

type Tooltip = { dayIndex: number; left: number; top: number };

export function GitHubActivity() {
  const [focusedDay, setFocusedDay] = useState(days.length - 1);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollLeft = scroll.scrollWidth;
  }, []);

  function showTooltip(dayIndex: number, target: HTMLButtonElement) {
    const chart = chartRef.current;
    if (!chart) return;
    const bounds = chart.getBoundingClientRect();
    const cell = target.getBoundingClientRect();
    setTooltip({
      dayIndex,
      left: Math.max(128, Math.min(bounds.width - 128, cell.left - bounds.left + cell.width / 2)),
      top: cell.top - bounds.top - 8,
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") {
      setTooltip(null);
      return;
    }
    const weekday = (index + startOffset) % 7;
    const destinations: Record<string, number> = {
      ArrowLeft: index - 7,
      ArrowRight: index + 7,
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      Home: index - weekday,
      End: index + 6 - weekday,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    const nextIndex = Math.max(0, Math.min(days.length - 1, destinations[event.key]));
    const target = dayRefs.current[nextIndex];
    target?.focus();
    if (target) requestAnimationFrame(() => showTooltip(nextIndex, target));
  }

  return (
    <section aria-labelledby="github-activity">
      <h2 id="github-activity" className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        GitHub Activity
      </h2>
      <p id="github-activity-instructions" className="sr-only">
        Daily contributions for {activity.username}. Use the arrow keys to explore dates, or hover or tap a square for details.
      </p>
      <div ref={chartRef} className="relative mt-5">
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-2 [scrollbar-width:thin]"
          onScroll={() => setTooltip(null)}
          onPointerLeave={() => setTooltip(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setTooltip(null);
          }}
        >
          <div className="min-w-[576px] px-0.5">
            <div
              aria-hidden="true"
              className="mb-2 grid gap-[3px] text-[11px] leading-4 text-neutral-500 dark:text-neutral-400"
              style={{ gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))` }}
            >
              {months.map((month) => (
                <span key={month.date} style={{ gridColumn: month.column + 1 }}>{month.label}</span>
              ))}
            </div>
            <div
              role="group"
              aria-label={`${activity.total} GitHub contributions in the last year`}
              aria-describedby="github-activity-instructions"
              className="grid grid-flow-col grid-rows-7 gap-[3px] py-0.5"
              style={{ gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))` }}
            >
              {cells.map((day, cellIndex) => {
                if (!day) return <span key={`empty-${cellIndex}`} aria-hidden="true" />;
                const dayIndex = cellIndex - startOffset;
                return (
                  <button
                    key={day.date}
                    ref={(element) => { dayRefs.current[dayIndex] = element; }}
                    type="button"
                    aria-label={dayLabel(dayIndex)}
                    tabIndex={focusedDay === dayIndex ? 0 : -1}
                    data-date={day.date}
                    data-level={day.level}
                    className={`aspect-square w-full cursor-pointer rounded-[2px] ring-inset transition-[box-shadow] hover:ring-1 hover:ring-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-neutral-600 motion-reduce:transition-none dark:hover:ring-neutral-300 dark:focus-visible:outline-neutral-200 ${LEVEL_COLORS[day.level]}`}
                    onPointerEnter={(event) => showTooltip(dayIndex, event.currentTarget)}
                    onClick={(event) => showTooltip(dayIndex, event.currentTarget)}
                    onFocus={(event) => {
                      setFocusedDay(dayIndex);
                      showTooltip(dayIndex, event.currentTarget);
                    }}
                    onKeyDown={(event) => handleKeyDown(event, dayIndex)}
                  />
                );
              })}
            </div>
          </div>
        </div>
        {tooltip && (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs leading-5 text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900"
            style={{ left: tooltip.left, top: tooltip.top }}
          >
            {dayLabel(tooltip.dayIndex)}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
        <a
          href={`https://github.com/${activity.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm transition-colors hover:text-neutral-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 dark:hover:text-neutral-200"
          title={`View ${activity.username} on GitHub · data through ${days.at(-1)?.date}`}
        >
          {activity.total.toLocaleString("en-US")} contributions in the last year
        </a>
        <div className="flex items-center gap-1" aria-label="Contribution intensity from less to more">
          <span className="mr-1">Less</span>
          {LEVEL_COLORS.map((color, level) => (
            <span key={level} aria-hidden="true" className={`size-2.5 rounded-[2px] ${color}`} />
          ))}
          <span className="ml-1">More</span>
        </div>
      </div>
    </section>
  );
}
