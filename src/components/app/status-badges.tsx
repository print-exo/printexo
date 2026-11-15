import { AlertTriangle, Check, CircleDashed, Clock, Loader2, Package, PauseCircle, Truck, X } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { ConversionStatus, DesignStatus, OrderStatus } from "@/lib/domain/types";
import { ORDER_STATUS_LABEL } from "@/lib/domain/orders";

// Each status pairs color with an icon + label so it never relies on color alone.

const ORDER_TONE: Record<OrderStatus, { tone: BadgeTone; icon: typeof Check }> = {
  received: { tone: "neutral", icon: CircleDashed },
  on_hold: { tone: "warning", icon: PauseCircle },
  pending_review: { tone: "info", icon: Clock },
  approved: { tone: "primary", icon: Check },
  sent_to_production: { tone: "primary", icon: Package },
  in_production: { tone: "primary", icon: Loader2 },
  shipped: { tone: "success", icon: Truck },
  delivered: { tone: "success", icon: Check },
  cancelled: { tone: "neutral", icon: X },
  returned: { tone: "danger", icon: AlertTriangle },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { tone, icon: Icon } = ORDER_TONE[status];
  return (
    <Badge tone={tone}>
      <Icon aria-hidden />
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}

const DESIGN: Record<DesignStatus, { tone: BadgeTone; label: string; icon: typeof Check }> = {
  draft: { tone: "neutral", label: "Draft", icon: CircleDashed },
  submitted: { tone: "info", label: "In review", icon: Clock },
  approved: { tone: "success", label: "Approved", icon: Check },
  rejected: { tone: "danger", label: "Changes needed", icon: X },
};

export function DesignStatusBadge({ status }: { status: DesignStatus }) {
  const { tone, label, icon: Icon } = DESIGN[status];
  return (
    <Badge tone={tone}>
      <Icon aria-hidden />
      {label}
    </Badge>
  );
}

const CONVERSION: Record<ConversionStatus, { tone: BadgeTone; label: string; icon: typeof Check }> = {
  not_started: { tone: "neutral", label: "No print file", icon: CircleDashed },
  processing: { tone: "info", label: "Generating files", icon: Loader2 },
  ready: { tone: "success", label: "PNG + TIFF ready", icon: Check },
  failed: { tone: "danger", label: "Conversion failed", icon: AlertTriangle },
};

export function ConversionBadge({ status }: { status: ConversionStatus }) {
  const { tone, label, icon: Icon } = CONVERSION[status];
  return (
    <Badge tone={tone}>
      <Icon aria-hidden className={status === "processing" ? "animate-spin" : undefined} />
      {label}
    </Badge>
  );
}
