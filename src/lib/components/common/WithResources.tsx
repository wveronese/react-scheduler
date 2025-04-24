import { useMemo } from "react";
import { DefaultResource } from "../../types";
import { ResourceHeader } from "./ResourceHeader";
import { ButtonTabProps, ButtonTabs } from "./Tabs";
import useStore from "../../hooks/useStore";
import { Box, useTheme } from "@mui/material";
import { eachMinuteOfInterval, set } from "date-fns";
import { calcCellHeight, calcCellHeightWorkload } from "../../helpers/generals.tsx";

interface WithResourcesProps {
  renderChildren(resource: DefaultResource): React.ReactNode;
}
const WithResources = ({ renderChildren }: WithResourcesProps) => {
  const { resources, resourceFields, resourceViewMode, view, day, selectedDate, height } =
    useStore();
  const { startHour, endHour, step } = day!;
  const theme = useTheme();

  const START_TIME = set(selectedDate, { hours: startHour, minutes: 0, seconds: 0 });
  const END_TIME = set(selectedDate, { hours: endHour, minutes: -step, seconds: 0 });
  const hours = eachMinuteOfInterval(
    {
      start: START_TIME,
      end: END_TIME,
    },
    { step: step }
  );
  const CELL_HEIGHT =
    view === "day"
      ? calcCellHeight(height, hours.length)
      : calcCellHeightWorkload(height, hours.length);
  const MIN_HEIGHT = hours.length * CELL_HEIGHT;

  if (resourceViewMode === "tabs") {
    return <ResourcesTabTables renderChildren={renderChildren} />;
  } else if (resourceViewMode === "vertical") {
    return (
      <>
        {resources.map((res: DefaultResource, i: number) => (
          <Box key={`${res[resourceFields.idField]}_${i}`} sx={{ display: "flex" }}>
            <Box
              sx={{
                borderColor: theme.palette.grey[300],
                borderStyle: "solid",
                borderWidth: "1px 1px 0 1px",
                paddingTop: 1,
                flexBasis: 140,
              }}
            >
              <ResourceHeader resource={res} />
            </Box>
            <Box
              //
              sx={{ width: "100%", overflowX: "auto" }}
            >
              {renderChildren(res)}
            </Box>
          </Box>
        ))}
      </>
    );
  } else {
    return (
      <>
        {view === "workload" ? (
          <div
            key={0}
            style={{
              maxWidth: 60,
              minHeight: MIN_HEIGHT,
              position: "sticky",
              left: 0,
              zIndex: 1000,
            }}
          >
            <ResourceHeader resource={{ assignee: 0, text: "" }} />
            {renderChildren({ assignee: 0, text: "" })}
          </div>
        ) : (
          ""
        )}
        {resources.map((res: DefaultResource, i: number) => (
          <div
            key={`${res[resourceFields.idField]}_${i}`}
            style={{ minHeight: view === "workload" || view === "day" ? MIN_HEIGHT : "auto" }}
          >
            <ResourceHeader resource={res} />
            {renderChildren(res)}
          </div>
        ))}
      </>
    );
  }
};

const ResourcesTabTables = ({ renderChildren }: WithResourcesProps) => {
  const { resources, resourceFields, selectedTab, handleState, onResourceChange } = useStore();

  const tabs: ButtonTabProps[] = resources.map((res) => {
    return {
      id: res[resourceFields.idField],
      label: <ResourceHeader resource={res} />,
      component: <>{renderChildren(res)}</>,
    };
  });

  const setTab = (tab: DefaultResource["assignee"]) => {
    handleState(tab, "selectedTab");
    if (typeof onResourceChange === "function") {
      const selected = resources.find((re) => re[resourceFields.idField] === tab);
      if (selected) {
        onResourceChange(selected);
      }
    }
  };

  const currentTabSafeId = useMemo(() => {
    const firstId = resources[0][resourceFields.idField];
    if (!selectedTab) {
      return firstId;
    }

    // Make sure current selected id is within the resources array
    const idx = resources.findIndex((re) => re[resourceFields.idField] === selectedTab);
    if (idx < 0) {
      return firstId;
    }

    return selectedTab;
  }, [resources, resourceFields.idField, selectedTab]);

  return (
    <ButtonTabs tabs={tabs} tab={currentTabSafeId} setTab={setTab} style={{ display: "grid" }} />
  );
};

export { WithResources };
