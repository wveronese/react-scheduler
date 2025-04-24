import { useEffect, useState } from "react";
import { differenceInMinutes, set } from "date-fns";
import { BORDER_HEIGHT } from "../../helpers/constants";
import { getTimeZonedDate } from "../../helpers/generals";
import { TimeIndicatorBar } from "../../styles/styles";
import useStore from "../../hooks/useStore.ts";

interface CurrentTimeBarProps {
  startHour: number;
  step: number;
  minuteHeight: number;
  timeZone?: string;
  zIndex?: number;
}

function calculateTop({ startHour, step, minuteHeight, timeZone }: CurrentTimeBarProps): number {
  const now = getTimeZonedDate(new Date(), timeZone);

  const minutesFromTop = differenceInMinutes(now, set(now, { hours: startHour, minutes: 0 }));
  const topSpace = minutesFromTop * minuteHeight;
  const slotsFromTop = minutesFromTop / step;
  const borderFactor = slotsFromTop + BORDER_HEIGHT;
  return topSpace + borderFactor;
}

const CurrentTimeBar = (props: CurrentTimeBarProps) => {
  const [top, setTop] = useState(calculateTop(props));
  const { startHour, step, minuteHeight, timeZone } = props;
  const { view, resourceViewMode } = useStore();

  useEffect(() => {
    const calcProps = { startHour, step, minuteHeight, timeZone };
    setTop(calculateTop(calcProps));
    const interval = setInterval(() => setTop(calculateTop(calcProps)), 60 * 1000);
    return () => clearInterval(interval);
  }, [startHour, step, minuteHeight, timeZone]);

  useEffect(() => {
    let containerId = document.querySelector("#schedulerContainerId") as HTMLElement;
    if (view === "day" && resourceViewMode === "tabs") {
      containerId = document.querySelector("#dayContainerId") as HTMLElement;
    }
    if (top > 0) {
      containerId.scrollTop = top - 50;
    }
  }, [view, resourceViewMode, top]);

  // Prevent showing bar on top of days/header
  if (top < 0) return null;

  return (
    <TimeIndicatorBar style={{ top, zIndex: props.zIndex }}>
      <div />
      <div />
    </TimeIndicatorBar>
  );
};

export default CurrentTimeBar;
