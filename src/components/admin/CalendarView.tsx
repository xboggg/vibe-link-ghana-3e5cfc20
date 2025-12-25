import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export interface CalendarViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

interface CalendarEvent {
  order: Order;
  type: "event" | "delivery";
  date: Date;
}

export const CalendarView = ({ orders, onSelectOrder }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const events = useMemo(() => {
    const eventsList: CalendarEvent[] = [];
    
    orders.forEach((order) => {
      if (order.event_date) {
        eventsList.push({
          order,
          type: "event",
          date: parseISO(order.event_date),
        });
      }
      if (order.preferred_delivery_date) {
        eventsList.push({
          order,
          type: "delivery",
          date: parseISO(order.preferred_delivery_date),
        });
      }
    });
    
    return eventsList;
  }, [orders]);

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.date, day));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Get first day of month offset for grid alignment
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const emptyDays = Array(startingDayOfWeek).fill(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-4 text-sm mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Event Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Delivery Deadline</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for alignment */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[100px] bg-muted/20 rounded-lg" />
          ))}

          {/* Calendar days */}
          {calendarDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[100px] p-2 rounded-lg border transition-colors",
                  isToday ? "bg-primary/5 border-primary" : "bg-card border-border hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday ? "text-primary" : "text-foreground"
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <button
                      key={`${event.order.id}-${event.type}-${idx}`}
                      onClick={() => onSelectOrder(event.order)}
                      className={cn(
                        "w-full text-left px-1.5 py-0.5 rounded text-xs truncate transition-colors",
                        event.type === "event"
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-secondary/10 text-secondary-foreground hover:bg-secondary/20"
                      )}
                      title={`${event.order.event_title} - ${event.type === "event" ? "Event" : "Delivery"}`}
                    >
                      {event.type === "event" ? (
                        <Calendar className="inline h-3 w-3 mr-1" />
                      ) : (
                        <Truck className="inline h-3 w-3 mr-1" />
                      )}
                      {event.order.event_title.substring(0, 12)}
                      {event.order.event_title.length > 12 ? "..." : ""}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
