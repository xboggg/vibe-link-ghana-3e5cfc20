import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VisitorPresence {
  visitorId: string;
  page: string;
  lastSeen: string;
}

export const useRealtimeVisitors = () => {
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [visitorsByPage, setVisitorsByPage] = useState<Record<string, number>>({});

  useEffect(() => {
    const visitorId = sessionStorage.getItem("analytics_session_id") || crypto.randomUUID();
    
    const channel = supabase.channel("realtime-visitors", {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<VisitorPresence>();
        const allVisitors = Object.values(state).flat();
        setActiveVisitors(allVisitors.length);
        
        // Count visitors by page
        const pageCount: Record<string, number> = {};
        allVisitors.forEach((visitor) => {
          const page = visitor.page || "/";
          pageCount[page] = (pageCount[page] || 0) + 1;
        });
        setVisitorsByPage(pageCount);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            visitorId,
            page: window.location.pathname,
            lastSeen: new Date().toISOString(),
          });
        }
      });

    // Update presence when page changes
    const updatePresence = () => {
      channel.track({
        visitorId,
        page: window.location.pathname,
        lastSeen: new Date().toISOString(),
      });
    };

    // Listen for page changes
    window.addEventListener("popstate", updatePresence);

    return () => {
      window.removeEventListener("popstate", updatePresence);
      supabase.removeChannel(channel);
    };
  }, []);

  return { activeVisitors, visitorsByPage };
};
