import { Fragment, JSX, useCallback, useEffect } from "react";
import { Typography, useTheme } from "@mui/material";
import {
  addDays,
  eachMinuteOfInterval,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isToday,
  set,
  startOfDay,
} from "date-fns";
import EventItem from "../components/events/EventItem";
import { CellRenderedProps, DayHours, DefaultResource, ProcessedEvent } from "../types";
import {
  calcCellHeightWorkload,
  calcMinuteHeight,
  filterMultiDaySlot,
  filterTodayEvents,
  getHourFormat,
  getResourcedEvents,
} from "../helpers/generals";
import { WithResources } from "../components/common/WithResources";
import TodayEvents from "../components/events/TodayEvents";
import { TableGrid } from "../styles/styles";
import { MULTI_DAY_EVENT_HEIGHT } from "../helpers/constants";
import useStore from "../hooks/useStore";
import { DayAgenda } from "./DayAgenda";

export interface WorkloadProps {
  startHour: DayHours;
  endHour: DayHours;
  step: number;
  cellRenderer?(props: CellRenderedProps): JSX.Element;
  headRenderer?(day: Date): JSX.Element;
  hourRenderer?(hour: string): JSX.Element;
  navigation?: boolean;
}

const Workload = () => {
  const {
    day,
    selectedDate,
    events,
    height,
    getRemoteEvents,
    triggerLoading,
    handleState,
    resources,
    resourceFields,
    resourceViewMode,
    fields,
    direction,
    locale,
    hourFormat,
    timeZone,
    stickyNavigation,
    agenda,
  } = useStore();
  const theme = useTheme();

  const { startHour, endHour, step, cellRenderer, headRenderer, hourRenderer } = day!;
  const START_TIME = set(selectedDate, { hours: startHour, minutes: 0, seconds: 0 });
  const END_TIME = set(selectedDate, { hours: endHour, minutes: -step, seconds: 0 });
  const hours = eachMinuteOfInterval(
    {
      start: START_TIME,
      end: END_TIME,
    },
    { step: step }
  );
  const CELL_HEIGHT = calcCellHeightWorkload(height, hours.length);
  const MINUTE_HEIGHT = calcMinuteHeight(CELL_HEIGHT, step);
  const hFormat = getHourFormat(hourFormat);

  const fetchEvents = useCallback(async () => {
    try {
      triggerLoading(true);
      const start = addDays(START_TIME, -1);
      const end = addDays(END_TIME, 1);
      const events = await getRemoteEvents!({
        start,
        end,
        view: "day",
      });
      if (events && events?.length) {
        handleState(events, "events");
      }
    } catch (error) {
      throw error;
    } finally {
      triggerLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getRemoteEvents]);

  useEffect(() => {
    if (getRemoteEvents instanceof Function) {
      fetchEvents();
    }
  }, [fetchEvents, getRemoteEvents]);

  const renderMultiDayEvents = useCallback(
    (events: ProcessedEvent[]) => {
      const todayMulti = filterMultiDaySlot(events, selectedDate, timeZone);
      return (
        <div
          className="rs__block_col"
          style={{ height: MULTI_DAY_EVENT_HEIGHT * todayMulti.length }}
        >
          {todayMulti.map((event, i) => {
            const hasPrev = isBefore(event.start, startOfDay(selectedDate));
            const hasNext = isAfter(event.end, endOfDay(selectedDate));
            return (
              <div
                key={event.event_id}
                className="rs__multi_day"
                style={{
                  top: i * MULTI_DAY_EVENT_HEIGHT,
                  width: "99.9%",
                  overflowX: "hidden",
                }}
              >
                <EventItem event={event} multiday hasPrev={hasPrev} hasNext={hasNext} />
              </div>
            );
          })}
        </div>
      );
    },
    [selectedDate, timeZone]
  );

  const renderTable = useCallback(
    (resource?: DefaultResource) => {
      let resourcedEvents = events;
      if (resource) {
        resourcedEvents = getResourcedEvents(events, resource, resourceFields, fields);
      }

      if (agenda) {
        return <DayAgenda events={resourcedEvents} />;
      }

      return (
        <>
          {/* Header */}
          <TableGrid days={1} sticky={stickyNavigation ? "1" : "0"}></TableGrid>
          <TableGrid days={1}>
            {/* Body */}
            {hours.map((h, i) => {
              return (
                <Fragment key={i}>
                  {/* Time Cells */}
                  {parseInt(resource?.assignee as string) === 0 ? (
                    <span
                      className="rs__cell rs__header rs__time"
                      style={{
                        height: CELL_HEIGHT,
                        fontSize: "0.5rem",
                        width: "60px",
                        backgroundColor: theme.palette.grey[300],
                      }}
                    >
                      {typeof hourRenderer === "function" ? (
                        <div>{hourRenderer(format(h, hFormat, { locale }))}</div>
                      ) : (
                        <Typography variant="caption">{format(h, hFormat, { locale })}</Typography>
                      )}
                    </span>
                  ) : (
                    <span
                      className="rs__cell rs__header rs__time"
                      style={{ height: CELL_HEIGHT, fontSize: "0.5rem", borderRightWidth: 0 }}
                    ></span>
                  )}

                  <span
                    className={`rs__cell ${isToday(selectedDate) ? "rs__today_cell" : ""}`}
                    style={{
                      minWidth: parseInt(resource?.assignee as string) === 0 ? "0px" : "auto",
                    }}
                  >
                    {/* Events of this day - run once on the top hour column */}
                    {i === 0 && (
                      <TodayEvents
                        todayEvents={filterTodayEvents(resourcedEvents, selectedDate, timeZone)}
                        today={START_TIME}
                        minuteHeight={MINUTE_HEIGHT}
                        startHour={startHour}
                        endHour={endHour}
                        step={step}
                        direction={direction}
                        timeZone={timeZone}
                      />
                    )}
                  </span>
                </Fragment>
              );
            })}
          </TableGrid>
        </>
      );
    },
    [
      CELL_HEIGHT,
      MINUTE_HEIGHT,
      START_TIME,
      agenda,
      cellRenderer,
      direction,
      endHour,
      events,
      fields,
      hFormat,
      headRenderer,
      hourRenderer,
      hours,
      locale,
      renderMultiDayEvents,
      resourceFields,
      resourceViewMode,
      resources.length,
      selectedDate,
      startHour,
      step,
      stickyNavigation,
      timeZone,
    ]
  );

  return resources.length + 1 ? <WithResources renderChildren={renderTable} /> : renderTable();
};

export { Workload };
