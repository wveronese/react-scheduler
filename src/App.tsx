import { Scheduler } from "./lib";
import { useRef } from "react";
import { DefaultResource, EventRendererProps, ProcessedEvent, SchedulerRef } from "./lib/types";
import { Link } from "react-router-dom";
import { ButtonBase, Container, ListItem, ListItemText, Typography } from "@mui/material";
import { EventItemPaper } from "./lib/styles/styles.ts";

export interface SchedulerResource {
  assignee: number;
  text: string;
  subtext: string;
  start?: string;
  end?: string;
}

function App() {
  const calendarRef = useRef<SchedulerRef>(null);
  const resources: SchedulerResource[] = [
    {
      assignee: 1,
      text: "User 1",
      subtext: "User 1",
    },
    {
      assignee: 2,
      text: "User 2",
      subtext: "User 2",
    },
    {
      assignee: 3,
      text: "User 3",
      subtext: "User 3",
    },
    {
      assignee: 4,
      text: "User 4",
      subtext: "User 4",
    },
    {
      assignee: 5,
      text: "User 5",
      subtext: "User 5",
    },
    {
      assignee: 6,
      text: "User 6",
      subtext: "User 6",
    },
    {
      assignee: 7,
      text: "User 7",
      subtext: "User 7",
    },
    {
      assignee: 8,
      text: "User 8",
      subtext: "User 8",
    },
    {
      assignee: 9,
      text: "User 9",
      subtext: "User 9",
    },
    {
      assignee: 10,
      text: "User 10",
      subtext: "User 10",
    },
    {
      assignee: 11,
      text: "User 11",
      subtext: "User 11",
    },
    {
      assignee: 12,
      text: "User 12",
      subtext: "User 12",
    },
  ];

  const events: ProcessedEvent[] = [
    {
      event_id: "1",
      calendarId: "12",
      clientId: "2",
      title: "INC000001259111: desc",
      ticket: "INC000001259111",
      description: "desc",
      start: new Date(),
      issuer: "user 5",
      end: new Date(Date.now() + 20 * (60 * 1000)),
      assignee: 1,
      subtext: "user 5",
      color: "rgb(183,199,226)",
      online: true,
      meetingUrl: null,
      genCatTier1: "PORTAL CORPORATIVO",
      genCatTier2: "PORTAL CORPORATIVO",
      genCatTier3: "INCIDENCIA",
      prodCatTier1: "INDICADOR CATALOGO",
      prodCatTier2: "SD",
      prodCatTier3: "SD",
      prodName: "-",
      urgency: "4-Low",
      impact: "4-Minor/Localized",
      priority: "Low",
      vip: "No",
      externalId: null,
      type: "ONLINE",
    },
    {
      event_id: "2",
      calendarId: "12",
      clientId: "2",
      title: "INC000001259112: desc",
      ticket: "INC000001259112",
      description: "desc",
      start: new Date(Date.now() + 2 * (60 * 60 * 1000)),
      issuer: "user 6",
      end: new Date(Date.now() + 2 * (60 * 60 * 1000) + 20 * (60 * 1000)),
      assignee: 2,
      subtext: "user 6",
      color: "rgb(183,199,226)",
      online: true,
      meetingUrl: "",
      genCatTier1: "INVESDOC",
      genCatTier2: "INVESDOC",
      genCatTier3: "INCIDENCIA",
      prodCatTier1: "JOB",
      prodCatTier2: "SD",
      prodCatTier3: "SD",
      prodName: "-",
      urgency: "4-Low",
      impact: "4-Minor/Localized",
      priority: "Low",
      vip: "No",
      externalId: "",
      type: "ONLINE",
    },
  ];

  const calculateUrgencyColor = (urgency: string) => {
    switch (urgency.substring(0, 1)) {
      case "1": {
        return "#df5c65";
      }
      case "2": {
        return "#df7f5c";
      }
      case "3": {
        return "#3d708e";
      }
      case "4": {
        return "#799c61";
      }
      default: {
        return "#3d708e";
      }
    }
  };

  const eventRenderer = (props: EventRendererProps) => {
    const event: ProcessedEvent = props.event;
    return (
      <EventItemPaper
        key={`${event.start.getTime()}_${event.end.getTime()}_${event.event_id}`}
        disabled={event.disabled}
        sx={{
          bgcolor: calculateUrgencyColor(event.urgency || "0"),
          color: "#FFF",
          width: "100%",
          ...(event.sx || {}),
        }}
      >
        <ButtonBase
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof props.onClick === "function") {
              props.onClick(e);
            }
          }}
          focusRipple
        >
          <div>
            <div style={{ padding: "6px 2px" }}>
              <Typography variant="subtitle2" style={{ fontSize: 10.5 }} noWrap>
                {event.ticket}
              </Typography>
            </div>
          </div>
        </ButtonBase>
      </EventItemPaper>
    );
  };

  const resourceHeaderRenderer = (resource: DefaultResource) => {
    return (
      <ListItem
        sx={{
          width: parseInt(resource?.assignee as string) === 0 ? "auto" : "80",
          padding: "2px 10px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "#90cdf9",
          textAlign: "left",
          borderColor: "#e0e0e0",
          borderStyle: "solid",
          borderWidth: 1,
        }}
        component="div"
      >
        <ListItemText
          sx={{ width: parseInt(resource?.assignee as string) === 0 ? "auto" : 90, height: 60 }}
          primary={<Typography variant="body2">{resource.text}</Typography>}
        />
      </ListItem>
    );
  };

  return (
    <>
      <div>
        <Link to="/1">Go to page 1</Link>
      </div>

      <Container maxWidth={"xl"} sx={{ height: "700px" }}>
        <Scheduler
          day={{ startHour: 0, endHour: 24, step: 20, navigation: true }}
          ref={calendarRef}
          resources={resources}
          height={600}
          view={"workload"}
          resourceViewMode={"default"}
          stickyNavigation={false}
          hourFormat={"24"}
          events={events}
          eventRenderer={eventRenderer}
          resourceHeaderComponent={resourceHeaderRenderer}
          editable={false}
          deletable={false}
          // events={generateRandomEvents(200)}
        />
      </Container>
    </>
  );
}

export default App;
