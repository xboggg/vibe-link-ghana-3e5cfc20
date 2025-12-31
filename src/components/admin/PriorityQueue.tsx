import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
  Clock,
  Calendar,
  Package,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

interface Order {
  id: string;
  event_title: string;
  client_name: string;
  event_date: string | null;
  event_type: string;
  order_status: string;
  payment_status: string;
  total_price: number;
  created_at: string;
}

interface PrioritizedOrder extends Order {
  priority: number;
  priorityReason: string;
}

const priorityConfig = {
  1: {
    label: 'Urgent',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'border-l-red-500'
  },
  2: {
    label: 'High',
    icon: ArrowUp,
    color: 'text-orange-600',
    bgColor: 'border-l-orange-500'
  },
  3: {
    label: 'Normal',
    icon: Minus,
    color: 'text-blue-600',
    bgColor: 'border-l-blue-500'
  },
  4: {
    label: 'Low',
    icon: ArrowDown,
    color: 'text-gray-600',
    bgColor: 'border-l-gray-400'
  },
};

// Calculate priority based on event date (client-side - no DB changes needed)
const calculatePriority = (order: Order): PrioritizedOrder => {
  const eventDate = order.event_date;
  let priority = 3;
  let priorityReason = 'Normal priority';

  if (eventDate) {
    const daysUntil = differenceInDays(new Date(eventDate), new Date());

    if (daysUntil < 0) {
      priority = 1;
      priorityReason = 'Event date passed!';
    } else if (daysUntil <= 2) {
      priority = 1;
      priorityReason = daysUntil === 0 ? 'Event is today!' : daysUntil === 1 ? 'Event is tomorrow' : `Event in ${daysUntil} days`;
    } else if (daysUntil <= 5) {
      priority = 2;
      priorityReason = `Event in ${daysUntil} days`;
    } else if (daysUntil <= 14) {
      priority = 3;
      priorityReason = `Event in ${daysUntil} days`;
    } else {
      priority = 4;
      priorityReason = `Event in ${daysUntil} days`;
    }
  } else {
    priority = 3;
    priorityReason = 'No event date set';
  }

  // Boost priority for revision status
  if (order.order_status === 'revision' && priority > 2) {
    priority = 2;
    priorityReason = 'Revision requested';
  }

  return { ...order, priority, priorityReason };
};

export const PriorityQueue = () => {
  const [orders, setOrders] = useState<PrioritizedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('order_status', ['pending', 'in_progress', 'draft_ready', 'revision'])
        .order('event_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate priority client-side based on event_date
      const prioritized = (data || [])
        .map(calculatePriority)
        .sort((a, b) => a.priority - b.priority);

      setOrders(prioritized);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to load priority queue');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilEvent = (eventDate: string | null): number | null => {
    if (!eventDate) return null;
    return differenceInDays(new Date(eventDate), new Date());
  };

  const getUrgencyBadge = (daysUntil: number | null) => {
    if (daysUntil === null) return null;
    if (daysUntil < 0) return <Badge variant="destructive">Past Due</Badge>;
    if (daysUntil === 0) return <Badge variant="destructive">Today!</Badge>;
    if (daysUntil === 1) return <Badge variant="destructive">Tomorrow</Badge>;
    if (daysUntil <= 3) return <Badge className="bg-red-500">In {daysUntil} days</Badge>;
    if (daysUntil <= 7) return <Badge className="bg-orange-500">In {daysUntil} days</Badge>;
    return null;
  };

  // Group orders by priority
  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.priority]) acc[order.priority] = [];
    acc[order.priority].push(order);
    return acc;
  }, {} as Record<number, PrioritizedOrder[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const totalActive = orders.length;
  const urgentCount = groupedOrders[1]?.length || 0;
  const highCount = groupedOrders[2]?.length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold">{totalActive}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{highCount}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Button variant="outline" className="w-full" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>

      {[1, 2, 3, 4].map((priority) => {
        const config = priorityConfig[priority as keyof typeof priorityConfig];
        const priorityOrders = groupedOrders[priority] || [];

        if (priorityOrders.length === 0) return null;

        return (
          <Card key={priority} className={`border-l-4 ${config.bgColor}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <config.icon className={`h-5 w-5 ${config.color}`} />
                {config.label} Priority
                <Badge variant="secondary" className="ml-2">
                  {priorityOrders.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priorityOrders.map((order) => {
                  const daysUntil = getDaysUntilEvent(order.event_date);
                  const urgencyBadge = getUrgencyBadge(daysUntil);

                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{order.event_title}</h4>
                          <Badge variant="outline">{order.event_type}</Badge>
                          <Badge className={
                            order.order_status === 'pending' ? 'bg-yellow-500' :
                            order.order_status === 'in_progress' ? 'bg-blue-500' :
                            order.order_status === 'draft_ready' ? 'bg-purple-500' :
                            'bg-orange-500'
                          }>
                            {order.order_status.replace('_', ' ')}
                          </Badge>
                          {urgencyBadge}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{order.client_name}</span>
                          {order.event_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(order.event_date), 'MMM d, yyyy')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(order.created_at), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.priorityReason}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {orders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="font-medium text-lg">No active orders</h3>
            <p className="text-muted-foreground">
              All orders are completed or cancelled
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PriorityQueue;

