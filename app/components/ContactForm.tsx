"use client";

import { useRef, useState, type FormEvent } from "react";

const TRIP_TYPES = [
  "Heritage Stays",
  "International Holiday",
  "Mountain Retreat",
  "Backwaters & Beaches",
  "Wildlife & Safari",
  "Corporate / MICE",
  "Honeymoon",
  "Not sure yet — help me plan",
];

type Status = "idle" | "loading" | "success" | "error";

const fieldClass =
  "w-full py-3.5 bg-transparent border-0 border-b border-line font-sans text-[15px] text-ink outline-none transition-colors duration-300 focus:border-accent font-normal";

const labelClass =
  "block text-[11px] uppercase text-muted mb-2.5 font-medium";

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus]   = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    data.get("name"),
          email:   data.get("email"),
          phone:   data.get("phone"),
          type:    data.get("type"),
          subject: data.get("subject"),
          message: data.get("message"),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(json.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      formRef.current?.reset();
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-5">
        <span
          className="w-[72px] h-[72px] rounded-full grid place-items-center mb-2 text-[28px] text-white"
          style={{ background: "#c8a45a" }}
        >
          ✓
        </span>
        <h4 className="font-serif text-[1.6rem] font-medium text-ink">
          Message sent!
        </h4>
        <p className="text-muted text-sm max-w-[320px] leading-[1.75]">
          A real travel planner will get back to you within one working day.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="btn btn-dark mt-2"
        >
          Send another <span className="arrow">→</span>
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate>
      <div
        className="grid gap-6 mb-[22px] max-[880px]:grid-cols-1"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        <div>
          <label htmlFor="cf-name" className={labelClass} style={{ letterSpacing: "0.2em" }}>
            Name
          </label>
          <input
            id="cf-name"
            type="text"
            name="name"
            required
            placeholder="Your full name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="cf-email" className={labelClass} style={{ letterSpacing: "0.2em" }}>
            Email
          </label>
          <input
            id="cf-email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>
      </div>

      <div
        className="grid gap-6 mb-[22px] max-[880px]:grid-cols-1"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        <div>
          <label htmlFor="cf-phone" className={labelClass} style={{ letterSpacing: "0.2em" }}>
            Phone
          </label>
          <input
            id="cf-phone"
            type="tel"
            name="phone"
            placeholder="+91 ·····"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="cf-type" className={labelClass} style={{ letterSpacing: "0.2em" }}>
            Type of Trip
          </label>
          <select id="cf-type" name="type" className={fieldClass}>
            {TRIP_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-[22px]">
        <label htmlFor="cf-subject" className={labelClass} style={{ letterSpacing: "0.2em" }}>
          Subject
        </label>
        <input
          id="cf-subject"
          type="text"
          name="subject"
          placeholder="A 10-day Kerala trip in March, etc."
          className={fieldClass}
        />
      </div>

      <div className="mb-[22px]">
        <label htmlFor="cf-message" className={labelClass} style={{ letterSpacing: "0.2em" }}>
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={4}
          required
          placeholder="Tell us about the trip you have in mind — dates, destinations, who's travelling, any inspiration..."
          className={`${fieldClass} resize-y min-h-[110px]`}
        />
      </div>

      {status === "error" && (
        <p className="text-red-500 text-sm mb-4 text-center leading-[1.6]">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          "Sending…"
        ) : (
          <>Send Message <span className="arrow">→</span></>
        )}
      </button>

      <p className="text-xs mt-4 text-center text-muted">
        No spam. We respond within one working day.
      </p>
    </form>
  );
}
