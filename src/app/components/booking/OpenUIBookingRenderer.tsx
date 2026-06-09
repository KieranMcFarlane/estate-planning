"use client";

import { createLibrary, defineComponent, Renderer, useIsStreaming, useTriggerAction } from "@openuidev/react-lang";
import { ArrowRight, Calendar, CheckCircle2, ExternalLink } from "lucide-react";
import { z } from "zod";
import styles from "./OpenUIBookingRenderer.module.css";

type ToolLikePart = {
  type: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

type Slot = {
  date: string;
  start: string;
  end?: string;
  label?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function formatSlotLabel(slot: Slot) {
  const start = new Date(slot.start);
  if (Number.isNaN(start.getTime())) return slot.label || slot.start;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(start);
}

function esc(value: unknown) {
  return JSON.stringify(value ?? "");
}

const BookingLink = defineComponent({
  name: "BookingLink",
  description: "Shows a Cal booking link for an initial conversation.",
  props: z.object({
    bookingUrl: z.string(),
    note: z.string(),
  }),
  component: function BookingLinkComponent({ props }) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Book an initial chat</h3>
          <ExternalLink size={16} aria-hidden="true" />
        </div>
        <p className={styles.panelText}>{props.note}</p>
        <a className={styles.linkButton} href={props.bookingUrl} target="_blank" rel="noreferrer">
          Open booking page
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
    );
  },
});

const SlotPicker = defineComponent({
  name: "SlotPicker",
  description: "Shows available Cal slots and lets the visitor choose one.",
  props: z.object({
    slots: z.array(z.object({
      date: z.string(),
      start: z.string(),
      end: z.string().optional(),
      label: z.string().optional(),
    })),
  }),
  component: function SlotPickerComponent({ props }) {
    const triggerAction = useTriggerAction();
    const isStreaming = useIsStreaming();

    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Available appointment slots</h3>
          <Calendar size={16} aria-hidden="true" />
        </div>
        <div className={styles.slotList}>
          {props.slots.map((slot) => {
            const label = slot.label || formatSlotLabel(slot);
            return (
              <button
                className={styles.slotButton}
                type="button"
                key={`${slot.start}-${slot.end ?? ""}`}
                disabled={isStreaming}
                onClick={() => {
                  void triggerAction(`I would like to book ${label}. Start time: ${slot.start}.`);
                }}
              >
                <span className={styles.slotMeta}>
                  <span className={styles.slotLabel}>{label}</span>
                  <span className={styles.slotTime}>{slot.end ? `${slot.start} to ${slot.end}` : slot.start}</span>
                </span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
    );
  },
});

const BookingStatus = defineComponent({
  name: "BookingStatus",
  description: "Shows booking or availability status.",
  props: z.object({
    ok: z.boolean(),
    message: z.string(),
    bookingUrl: z.string().optional(),
  }),
  component: function BookingStatusComponent({ props }) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={`${styles.panelTitle} ${props.ok ? styles.statusReady : styles.statusIssue}`}>
            {props.ok ? "Booking update" : "Booking needs attention"}
          </h3>
          {props.ok ? <CheckCircle2 size={16} aria-hidden="true" /> : <Calendar size={16} aria-hidden="true" />}
        </div>
        <p className={styles.panelText}>{props.message}</p>
        {props.bookingUrl && (
          <a className={styles.linkButton} href={props.bookingUrl} target="_blank" rel="noreferrer">
            Open booking page
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        )}
      </div>
    );
  },
});

const BookingSuccess = defineComponent({
  name: "BookingSuccess",
  description: "Shows a successfully created booking.",
  props: z.object({
    message: z.string(),
    bookingUid: z.string().optional(),
    status: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    bookingUrl: z.string().optional(),
  }),
  component: function BookingSuccessComponent({ props }) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={`${styles.panelTitle} ${styles.statusReady}`}>Booking requested</h3>
          <CheckCircle2 size={16} aria-hidden="true" />
        </div>
        <p className={styles.panelText}>{props.message}</p>
        {props.start && <p className={styles.panelText}>Start: {props.start}</p>}
        {props.end && <p className={styles.panelText}>End: {props.end}</p>}
        {props.status && <p className={styles.panelText}>Status: {props.status}</p>}
        {props.bookingUid && <p className={styles.panelText}>Reference: {props.bookingUid}</p>}
        {props.bookingUrl && (
          <a className={styles.linkButton} href={props.bookingUrl} target="_blank" rel="noreferrer">
            Open booking page
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        )}
      </div>
    );
  },
});

const bookingLibrary = createLibrary({
  components: [BookingLink, SlotPicker, BookingStatus, BookingSuccess],
});

function openUiForToolPart(part: ToolLikePart) {
  if (part.state === "input-streaming" || part.state === "input-available") {
    return `root = BookingStatus(false, "Checking booking details...", "")`;
  }
  if (part.state === "output-error") {
    return `root = BookingStatus(false, ${esc(part.errorText || "The booking tool could not complete.")}, "")`;
  }
  if (part.state !== "output-available") return null;

  const output = asRecord(part.output);
  if (part.type === "tool-bookingLink") {
    const enabled = Boolean(output.enabled);
    if (!enabled) {
      return `root = BookingStatus(false, ${esc(text(output.note) || "Booking link is not configured.")}, "")`;
    }
    return `root = BookingLink(${esc(text(output.bookingUrl))}, ${esc(text(output.note))})`;
  }

  if (part.type === "tool-getAvailableSlots") {
    const ok = Boolean(output.ok);
    const slots = Array.isArray(output.slots)
      ? output.slots.map((slot) => {
          const item = asRecord(slot);
          return {
            date: text(item.date),
            start: text(item.start),
            end: text(item.end) || undefined,
            label: text(item.label) || undefined,
          };
        }).filter((slot) => slot.start)
      : [];
    if (!ok || !slots.length) {
      return `root = BookingStatus(false, ${esc(text(output.message) || "No slots were returned.")}, ${esc(text(output.bookingUrl))})`;
    }
    return `root = SlotPicker(${JSON.stringify(slots)})`;
  }

  if (part.type === "tool-createBooking") {
    const ok = Boolean(output.ok);
    if (!ok) {
      return `root = BookingStatus(false, ${esc(text(output.message) || "The booking could not be created.")}, ${esc(text(output.bookingUrl))})`;
    }
    return [
      "root = BookingSuccess(",
      [
        esc(text(output.message) || "Booking request sent to Cal."),
        esc(text(output.bookingUid)),
        esc(text(output.status)),
        esc(text(output.start)),
        esc(text(output.end)),
        esc(text(output.bookingUrl)),
      ].join(", "),
      ")",
    ].join("");
  }

  return null;
}

export function OpenUIBookingRenderer({
  part,
  isStreaming,
  onUserMessage,
}: {
  part: ToolLikePart;
  isStreaming: boolean;
  onUserMessage: (message: string) => void;
}) {
  const response = openUiForToolPart(part);
  if (!response) return null;

  return (
    <div className={styles.bookingUi}>
      <Renderer
        response={response}
        library={bookingLibrary}
        isStreaming={isStreaming}
        onAction={(event) => onUserMessage(event.humanFriendlyMessage)}
      />
    </div>
  );
}
