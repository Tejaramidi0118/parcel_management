import { CheckCircle2, Circle, Package, MapPin, Truck, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrackingEvent {
  id?: string;
  type: string;
  timestamp: string;
  location?: string;
  notes?: string;
  actorId?: string;
}

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

// Define status order for timeline
const statusOrder = [
  'created',
  'picked_up',
  'in_transit',
  'at_hub',
  'out_for_delivery',
  'delivered',
  'cancelled'
];

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  created: { label: 'Order Placed', icon: Package, color: 'text-blue-600' },
  picked_up: { label: 'Picked Up', icon: Truck, color: 'text-blue-600' },
  in_transit: { label: 'In Transit', icon: Truck, color: 'text-yellow-600' },
  at_hub: { label: 'At Hub', icon: MapPin, color: 'text-yellow-600' },
  out_for_delivery: { label: 'Out for Delivery', icon: Truck, color: 'text-orange-600' },
  delivered: { label: 'Delivered', icon: Home, color: 'text-green-600' },
  cancelled: { label: 'Cancelled', icon: Circle, color: 'text-red-600' },
};

export default function TrackingTimeline({ events }: TrackingTimelineProps) {
  // Sort events by status order and timestamp
  const sortedEvents = [...events].sort((a, b) => {
    const aIndex = statusOrder.indexOf(a.type);
    const bIndex = statusOrder.indexOf(b.type);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  // Get unique statuses in order
  const uniqueStatuses = Array.from(
    new Set(sortedEvents.map(e => e.type))
  ).sort((a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b));

  // Get current status (last event)
  const currentStatus = sortedEvents[sortedEvents.length - 1]?.type || 'created';
  const currentIndex = statusOrder.indexOf(currentStatus);

  // Create timeline with all possible statuses up to current
  const timelineStatuses = statusOrder.slice(0, currentIndex + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineStatuses.map((status, index) => {
            const config = statusConfig[status] || { label: status, icon: Circle, color: 'text-gray-600' };
            const Icon = config.icon;
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const event = sortedEvents.find(e => e.type === status);
            const date = event ? new Date(event.timestamp) : null;

            return (
              <div key={status} className="relative flex gap-4">
                {/* Timeline line */}
                {index < timelineStatuses.length - 1 && (
                  <div
                    className={`absolute left-5 top-10 w-0.5 h-full ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    style={{ height: 'calc(100% + 1rem)' }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isCompleted || isCurrent ? 'text-white' : 'text-gray-400'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`font-semibold ${
                          isCompleted ? 'text-green-600' : isCurrent ? 'text-primary' : 'text-gray-400'
                        }`}
                      >
                        {config.label}
                      </p>
                      {event && (
                        <>
                          {event.location && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.location}
                            </p>
                          )}
                          {event.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.notes}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    {date && (
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        <p>{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
