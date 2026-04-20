import { translationContext } from "@repo/infrastructure/translations/TranslationContext";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { type DayButton, DayPicker, getDefaultClassNames, type Locale } from "react-day-picker";
import { da, enUS } from "react-day-picker/locale";

import { cn } from "../utils";
import { Button, buttonVariants } from "./Button";

/**
 * Maps app locale codes to react-day-picker locale objects.
 * Add new locales here when extending language support.
 */
const localeMap: Record<string, Locale> = {
  "en-US": enUS,
  "da-DK": da
};

/**
 * Capitalizes the first letter of a string.
 */
function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// 5 columns × 6 rows = 30 years per page. Page anchors to a year ≡ 1 (mod 5) so each row is a tidy
// 5-year bucket (2011-2015, 2016-2020, ...). The current year sits in row 4 (the third row from
// the bottom), so the user sees 3 buckets before and 2 after the current one.
const yearsPerPage = 30;
const yearsPerRow = 5;

function alignedYearPageStart(year: number): number {
  const target = year - 15;
  const offset = (((target - 1) % yearsPerRow) + yearsPerRow) % yearsPerRow;
  return target - offset;
}

type CalendarView = "days" | "months" | "years";

function pickInitialMonth(selected: unknown, defaultMonth: Date | undefined): Date {
  if (defaultMonth) {
    return defaultMonth;
  }
  if (selected instanceof Date) {
    return selected;
  }
  if (selected && typeof selected === "object" && "from" in selected) {
    const { from } = selected as { from: unknown };
    if (from instanceof Date) {
      return from;
    }
  }
  return new Date();
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  weekStartsOn = 1,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  locale: localeProp,
  defaultMonth,
  month: monthProp,
  onMonthChange,
  "aria-invalid": ariaInvalid,
  "aria-disabled": ariaDisabled,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  "aria-invalid"?: boolean;
  "aria-disabled"?: boolean;
}) {
  const { currentLocale } = React.useContext(translationContext);
  const locale = localeProp ?? localeMap[currentLocale] ?? enUS;
  const defaultClassNames = getDefaultClassNames();

  // Track displayed month internally so the year/month picker views can navigate without requiring
  // the consumer to wire up `month`/`onMonthChange`. If the consumer does control `month`, we honor
  // it and forward changes via `onMonthChange`.
  const initialMonth = React.useMemo(
    () => pickInitialMonth((props as { selected?: unknown }).selected, defaultMonth),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [internalMonth, setInternalMonth] = React.useState<Date>(monthProp ?? initialMonth);
  const displayMonth = monthProp ?? internalMonth;
  const updateDisplayMonth = (next: Date) => {
    if (monthProp == null) {
      setInternalMonth(next);
    }
    onMonthChange?.(next);
  };

  const [view, setView] = React.useState<CalendarView>("days");
  const [yearPageStart, setYearPageStart] = React.useState(() => alignedYearPageStart(initialMonth.getFullYear()));

  const today = React.useMemo(() => new Date(), []);
  // startMonth/endMonth flow through `...props` to DayPicker; we also use them to grey out
  // unreachable cells in the year and month picker views.
  const startMonth = (props as { startMonth?: Date }).startMonth;
  const endMonth = (props as { endMonth?: Date }).endMonth;

  if (view === "years") {
    return (
      <YearPickerView
        pageStart={yearPageStart}
        selectedYear={displayMonth.getFullYear()}
        currentYear={today.getFullYear()}
        minYear={startMonth?.getFullYear()}
        maxYear={endMonth?.getFullYear()}
        onShiftPage={(delta) => setYearPageStart((current) => current + delta)}
        onSelectYear={(year) => {
          updateDisplayMonth(new Date(year, displayMonth.getMonth(), 1));
          setView("months");
        }}
      />
    );
  }

  if (view === "months") {
    return (
      <MonthPickerView
        year={displayMonth.getFullYear()}
        selectedMonth={displayMonth.getMonth()}
        currentDate={today}
        localeCode={locale.code}
        startMonth={startMonth}
        endMonth={endMonth}
        onSelectMonth={(monthIndex) => {
          updateDisplayMonth(new Date(displayMonth.getFullYear(), monthIndex, 1));
          setView("days");
        }}
        onShiftYear={(delta) =>
          updateDisplayMonth(new Date(displayMonth.getFullYear() + delta, displayMonth.getMonth(), 1))
        }
      />
    );
  }

  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      weekStartsOn={weekStartsOn}
      month={displayMonth}
      onMonthChange={(next) => {
        updateDisplayMonth(next);
        setYearPageStart(alignedYearPageStart(next.getFullYear()));
      }}
      className={cn(
        "group/calendar w-fit overflow-hidden rounded-md border bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:var(--control-height)] [--rdp-nav_button-height:var(--control-height)] [--rdp-nav_button-width:var(--control-height)] in-data-[slot=card-content]:border-0 in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:border-0 in-data-[slot=popover-content]:bg-transparent aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:outline aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive",
        String.raw`rtl:[&_.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:[&_.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatCaption: (date, options) => {
          const month = date.toLocaleString(options?.locale?.code ?? "default", { month: "long" });
          const year = date.getFullYear();
          return `${capitalizeFirstLetter(month)} ${year}`;
        },
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        // Nav overlays the caption row; without pointer-events-none its empty middle area would
        // swallow clicks meant for the CaptionLabel button underneath. Buttons inside re-enable
        // pointer events so they remain clickable.
        nav: cn(
          "pointer-events-none absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "pointer-events-auto size-(--cell-size) select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "pointer-events-auto size-(--cell-size) select-none aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "cn-calendar-dropdown-root relative rounded-(--cell-radius)",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("absolute inset-0 bg-popover opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "font-medium select-none",
          captionLayout === "label"
            ? "text-sm"
            : "cn-calendar-caption-label flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn("text-[0.8rem] text-muted-foreground select-none", defaultClassNames.week_number),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
            : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate -z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate -z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
          defaultClassNames.range_end
        ),
        today: cn(
          "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      }}
      components={{
        Root: ({ className, rootRef, ...rootProps }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(className)}
            aria-invalid={ariaInvalid}
            aria-disabled={ariaDisabled}
            {...rootProps}
          />
        ),
        Chevron: ({ className, orientation, ...chevronProps }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", className)} {...chevronProps} />;
          }

          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", className)} {...chevronProps} />;
          }

          return <ChevronDownIcon className={cn("size-4", className)} {...chevronProps} />;
        },
        CaptionLabel: ({ children }) => (
          <button
            type="button"
            onClick={() => {
              setYearPageStart(alignedYearPageStart(displayMonth.getFullYear()));
              setView("years");
            }}
            className="inline-flex items-center gap-1 rounded-(--cell-radius) px-2 py-1 text-sm font-medium select-none hover:bg-muted"
          >
            <span>{children}</span>
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          </button>
        ),
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...weekNumberProps }) => (
          <td {...weekNumberProps}>
            <div className="flex size-(--cell-size) items-center justify-center text-center">{children}</div>
          </td>
        ),
        ...components
      }}
      {...props}
    />
  );
}

interface YearPickerViewProps {
  pageStart: number;
  selectedYear: number;
  currentYear: number;
  minYear: number | undefined;
  maxYear: number | undefined;
  onShiftPage: (delta: number) => void;
  onSelectYear: (year: number) => void;
}

function YearPickerView({
  pageStart,
  selectedYear,
  currentYear,
  minYear,
  maxYear,
  onShiftPage,
  onSelectYear
}: YearPickerViewProps) {
  const years = Array.from({ length: yearsPerPage }, (_, index) => pageStart + index);
  const rangeLabel = `${pageStart} – ${pageStart + yearsPerPage - 1}`;
  return (
    <PickerShell
      caption={rangeLabel}
      onPreviousClick={() => onShiftPage(-yearsPerPage)}
      onNextClick={() => onShiftPage(yearsPerPage)}
    >
      <div className="grid h-full grid-cols-5 grid-rows-6 gap-0">
        {years.map((year) => {
          const isOutOfRange = (minYear != null && year < minYear) || (maxYear != null && year > maxYear);
          return (
            <PickerCell
              key={year}
              isSelected={year === selectedYear}
              isCurrent={year === currentYear}
              isDisabled={isOutOfRange}
              onClick={() => onSelectYear(year)}
              label={String(year)}
            />
          );
        })}
      </div>
    </PickerShell>
  );
}

interface MonthPickerViewProps {
  year: number;
  selectedMonth: number;
  currentDate: Date;
  localeCode: string | undefined;
  startMonth: Date | undefined;
  endMonth: Date | undefined;
  onSelectMonth: (monthIndex: number) => void;
  onShiftYear: (delta: number) => void;
}

function MonthPickerView({
  year,
  selectedMonth,
  currentDate,
  localeCode,
  startMonth,
  endMonth,
  onSelectMonth,
  onShiftYear
}: MonthPickerViewProps) {
  const monthNames = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, monthIndex) =>
        capitalizeFirstLetter(new Date(2000, monthIndex, 1).toLocaleString(localeCode ?? "default", { month: "long" }))
      ),
    [localeCode]
  );
  const isCurrentYear = year === currentDate.getFullYear();
  // A month is reachable if any day inside it falls within [startMonth, endMonth].
  const isMonthOutOfRange = (monthIndex: number) => {
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    if (startMonth && lastDayOfMonth < startMonth) return true;
    if (endMonth && firstDayOfMonth > endMonth) return true;
    return false;
  };
  return (
    <PickerShell caption={String(year)} onPreviousClick={() => onShiftYear(-1)} onNextClick={() => onShiftYear(1)}>
      <div className="grid h-full grid-cols-3 grid-rows-4 gap-0">
        {monthNames.map((monthName, monthIndex) => (
          <PickerCell
            key={monthName}
            isSelected={monthIndex === selectedMonth}
            isCurrent={isCurrentYear && monthIndex === currentDate.getMonth()}
            isDisabled={isMonthOutOfRange(monthIndex)}
            onClick={() => onSelectMonth(monthIndex)}
            label={monthName}
          />
        ))}
      </div>
    </PickerShell>
  );
}

interface PickerShellProps {
  caption: string;
  onPreviousClick: () => void;
  onNextClick: () => void;
  children: React.ReactNode;
}

function PickerShell({ caption, onPreviousClick, onNextClick, children }: PickerShellProps) {
  return (
    <div
      data-slot="calendar"
      // Outer dimensions match the days view exactly: 7 cells wide + p-2 padding for width;
      // 7 cells + p-2 + an extra 1rem for the weekday-header equivalent for height (282 × 298 on
      // desktop, scales with --cell-size on mobile).
      className="flex h-[calc(var(--cell-size)*7+2rem)] w-[calc(var(--cell-size)*7+1rem)] flex-col bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:var(--control-height)] in-data-[slot=popover-content]:bg-transparent"
    >
      <div className="flex h-(--cell-size) w-full items-center justify-between gap-1">
        <Button variant="ghost" size="icon" onClick={onPreviousClick} aria-label="Previous">
          <ChevronLeftIcon />
        </Button>
        <span className="text-sm font-medium select-none">{caption}</span>
        <Button variant="ghost" size="icon" onClick={onNextClick} aria-label="Next">
          <ChevronRightIcon />
        </Button>
      </div>
      <div className="mt-2 flex-1">{children}</div>
    </div>
  );
}

interface PickerCellProps {
  isSelected: boolean;
  isCurrent: boolean;
  isDisabled?: boolean;
  label: string;
  onClick: () => void;
}

function PickerCell({ isSelected, isCurrent, isDisabled, label, onClick }: PickerCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      data-selected={isSelected || undefined}
      data-current={isCurrent || undefined}
      data-disabled={isDisabled || undefined}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-(--cell-radius) px-3 text-sm font-normal select-none hover:bg-muted",
        isCurrent && !isSelected && "bg-muted text-foreground",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary",
        isDisabled && "cursor-not-allowed text-muted-foreground opacity-50 hover:bg-transparent"
      )}
    >
      {label}
    </button>
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus();
    }
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal focus-visible:-outline-offset-2 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground hover:data-[range-end=true]:bg-primary hover:data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground hover:data-[range-start=true]:bg-primary hover:data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground hover:data-[selected-single=true]:bg-primary hover:data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
