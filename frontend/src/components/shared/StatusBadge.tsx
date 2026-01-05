import { Badge } from '@/components/ui/badge';
import type { ParcelStatus } from '@/types';

interface StatusBadgeProps {
  status: ParcelStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: ParcelStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', variant: 'secondary' as const };
      case 'picked_up':
        return { label: 'Picked Up', variant: 'default' as const };
      case 'in_transit':
        return { label: 'In Transit', variant: 'default' as const };
      case 'at_hub':
        return { label: 'At Hub', variant: 'default' as const };
      case 'out_for_delivery':
        return { label: 'Out for Delivery', variant: 'default' as const };
      case 'delivered':
        return { label: 'Delivered', variant: 'default' as const };
      case 'cancelled':
        return { label: 'Cancelled', variant: 'destructive' as const };
      default:
        return { label: status, variant: 'secondary' as const };
    }
  };

  const config = getStatusConfig(status);

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
