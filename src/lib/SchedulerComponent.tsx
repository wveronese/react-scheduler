import { Week } from "./views/Week";
import { Navigation } from "./components/nav/Navigation";
import Editor from "./views/Editor";
import { CircularProgress, Typography } from "@mui/material";
import { Month } from "./views/Month";
import { Day } from "./views/Day";
import { Table, Wrapper } from "./styles/styles";
import { forwardRef, useMemo } from "react";
import useStore from "./hooks/useStore";
import { SchedulerRef } from "./types";
import { PositionProvider } from "./positionManger/provider";
import { Workload } from "./views/Workload";

const SchedulerComponent = forwardRef<SchedulerRef, unknown>(function SchedulerComponent(_, ref) {
  const store = useStore();
  const {
    view,
    dialog,
    loading,
    loadingComponent,
    resourceViewMode,
    resources,
    translations,
    height,
  } = store;

  const Views = useMemo(() => {
    switch (view) {
      case "month":
        return <Month />;
      case "week":
        return <Week />;
      case "day":
        return <Day />;
      case "workload":
        return <Workload />;
      default:
        return "";
    }
  }, [view]);

  const LoadingComp = useMemo(() => {
    return (
      <div className="rs__table_loading">
        {loadingComponent || (
          <div className="rs__table_loading_internal">
            <span>
              <CircularProgress size={50} />
              <Typography align="center">{translations.loading}</Typography>
            </span>
          </div>
        )}
      </div>
    );
  }, [loadingComponent, translations.loading]);

  return (
    <Wrapper
      dialog={dialog ? 1 : 0}
      data-testid="rs-wrapper"
      ref={(el) => {
        const calendarRef = ref as any;
        if (calendarRef) {
          calendarRef.current = {
            el,
            scheduler: store,
          };
        }
      }}
    >
      {loading ? LoadingComp : null}
      <Navigation />
      <Table
        resource_count={
          resourceViewMode === "default"
            ? view === "workload"
              ? resources.length + 1
              : resources.length
            : 1
        }
        // Temp resources/default `sticky` wontfix
        sx={{
          overflowX: resourceViewMode === "default" && resources.length > 1 ? "auto" : undefined,
          overflowY: resourceViewMode === "default" ? "auto" : undefined,
          height: resourceViewMode === "default" ? height : "auto",
          flexDirection: resourceViewMode === "vertical" ? "column" : undefined,
        }}
        data-testid="grid"
        id={"schedulerContainerId"}
      >
        <PositionProvider>{Views}</PositionProvider>
      </Table>
      {dialog && <Editor />}
    </Wrapper>
  );
});

export default SchedulerComponent;
