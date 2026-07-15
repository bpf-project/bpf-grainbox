import { z } from "zod";

/**
 * Upstream Vexa v0.12 gateway API contracts.
 * These match the response schemas from Vexa-ai/vexa core/gateway/contracts/api.v1
 */

export const meetingStatusSchema = z.enum([
  "requested",
  "joining",
  "awaiting_admission",
  "active",
  "needs_human_help",
  "stopping",
  "completed",
  "failed",
]);

export const platformSchema = z.enum([
  "google_meet",
  "zoom",
  "teams",
  "jitsi",
  "browser_session",
]);

export const meetingRuntimeSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  platform: platformSchema.nullable(),
  native_meeting_id: z.string().nullable(),
  constructed_meeting_url: z.string().nullable(),
  status: meetingStatusSchema,
  bot_container_id: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  completion_reason: z.string().nullable(),
  data: z.record(z.unknown()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
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
export type LifecycleEvent = z.infer<typeof lifecycleEventSchema>;

