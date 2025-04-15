import { useState } from "react";

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import {  
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths,
  isValid,
} from "date-fns";

import { enUS } from "date-fns/locale";
import{Calendar, dateFnsLocalizer } from "react-big-calendar";

import { Task } from "../types";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";

const locales = { 
  "en-US": enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DataCalendarProps {
  data: Task[];
};

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY" ) => void;
};

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => {
  return(
    <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
      <Button
        onClick={() => onNavigate("PREV")}
        variant="secondary"
        size="icon"
        className="flex items-center"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto">
        <CalendarIcon className="size-4 mr-2" />
        <p className="text-sm">
          {format(date, "MMMM yyyy")}
        </p>
      </div>
      <Button
        onClick={() => onNavigate("NEXT")}
        variant="secondary"
        size="icon"
        className="flex items-center"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  )
}

export const DataCalendar = ({data}: DataCalendarProps) => {
  // Filter out tasks without dueDate (we must have a date for calendar events)
  const filteredData = data.filter((task) => {
    return task.dueDate && isValid(new Date(task.dueDate));
  });
  
  const [value, setValue] = useState(
    new Date()  
  );

  const events = filteredData.map((task) => {
    const dueDate = new Date(task.dueDate);
    
    return {
      start: dueDate,
      end: dueDate,
      title: task.name || "Unnamed Task",
      project: task.project,
      assignee: task.assignee,
      status: task.status,
      id: task.$id,
    };
  });

  const handelNavigation = (action: "PREV" | "NEXT" | "TODAY") => {
    if(action === "PREV"){
      setValue(subMonths(value,1));
    } else if(action === "NEXT"){
      setValue(addMonths(value,1));
    } else if(action === "TODAY"){
      setValue(new Date());
    }
  };

  return(
    <Calendar
      localizer={localizer}
      date={value}
      events={events}
      views={["month"]}
      defaultView="month"
      showAllEvents
      className="h-full"
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) => localizer?.format(date, "EEE", culture) ?? "",
      }}
      components={{
        eventWrapper: ({ event }) => (
          <EventCard 
            id={event.id}
            title={event.title}
            assignee={event.assignee}
            project={event.project}
            status={event.status}
          />
        ),
        toolbar: () => (
          <CustomToolbar date={value} onNavigate={handelNavigation} />
        )
      }}
    />
  )
}