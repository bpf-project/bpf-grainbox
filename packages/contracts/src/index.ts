import { z } from "zod";

export const meetingStatusSchema = z.enum([
  "created",
  "waiting",
  "joining",
  "joined",
  "recording",
  "completed",
  "failed",
]);

export const botStatusSchema = z.enum([
  "created",
  "waiting",
  "connecting",
  "joining",
  "joined",
  "recording",
  "stopped",
  "failed",
]);

export const meetingRuntimeSchema = z.object({
  id: z.string(),
  platform: z.enum(["google_meet", "zoom", "teams"]),
  joinUrl: z.string().url(),
  status: meetingStatusSchema,
  provider: z.string(),
});

export const botRuntimeSchema = z.object({
  id: z.string(),
  meetingId: z.string(),
  status: botStatusSchema,
  provider: z.string(),
});

export const lifecycleEventSchema = z.object({
  schemaVersion: z.literal(1),
  eventId: z.string().min(1),
  type: z.enum([
    "meeting.created",
    "meeting.bot_joined",
    "meeting.completed",
    "meeting.failed",
    "transcript.segment",
  ]),
  occurredAt: z.string().datetime(),
  userId: z.string().min(1),
  meetingId: z.string().min(1),
  payload: z.record(z.unknown()),
});

export type MeetingRuntime = z.infer<typeof meetingRuntimeSchema>;
export type BotRuntime = z.infer<typeof botRuntimeSchema>;
export type LifecycleEvent = z.infer<typeof lifecycleEventSchema>;

