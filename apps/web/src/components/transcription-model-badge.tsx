"use client";

import { Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRuntimeConfig } from "@/hooks/use-runtime-config";
import { cn } from "@/lib/utils";

interface TranscriptionModelBadgeProps {
  className?: string;
}

/** Shows the transcription runtime selected by the deployment configuration. */
export function TranscriptionModelBadge({ className }: TranscriptionModelBadgeProps) {
  const { config } = useRuntimeConfig();
  const transcription = config?.transcription;

  if (!transcription) return null;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 text-muted-foreground", className)}
      title={`Transcription backend: ${transcription.backend}\nModel: ${transcription.model}`}
    >
      <Cpu className="h-3 w-3" aria-hidden="true" />
      <span>{transcription.label}</span>
    </Badge>
  );
}
