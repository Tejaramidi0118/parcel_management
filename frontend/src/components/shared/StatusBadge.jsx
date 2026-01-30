import { Badge } from '@/components/ui/badge';
export default function StatusBadge({ status }) {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return { label: 'Pending', variant: 'secondary' };
            case 'picked_up':
                return { label: 'Picked Up', variant: 'default' };
            case 'in_transit':
                return { label: 'In Transit', variant: 'default' };
            case 'at_hub':
                return { label: 'At Hub', variant: 'default' };
            case 'out_for_delivery':
                return { label: 'Out for Delivery', variant: 'default' };
            case 'delivered':
                return { label: 'Delivered', variant: 'default' };
            case 'cancelled':
                return { label: 'Cancelled', variant: 'destructive' };
            default:
                return { label: status, variant: 'secondary' };
        }
    };
    const config = getStatusConfig(status);
    return <Badge variant={config.variant}>{config.label}</Badge>;
}
