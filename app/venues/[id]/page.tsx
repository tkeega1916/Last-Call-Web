import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ENTERTAINMENT_KINDS,
  VENUE_TYPES,
  getUpcomingEventsForVenue,
  getVenue,
  lastVerified,
  sources,
} from "@/lib/data";
import { WEEKDAYS, dayOfWeek, formatShortDate, localDateOf, formatTime, formatTimeRange, todayLocal } from "@/lib/dates";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const venue = Number.isInteger(Number(id)) ? await getVenue(Number(id)) : null;
  return { title: venue ? `${venue.name} | Last Call` : "Venue | Last Call" };
}

// Monday first, the way people plan a week out.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default async function VenuePage({ params }: { params: Params }) {
  const { id } = await params;
  const venueId = Number(id);
  if (!Number.isInteger(venueId)) notFound();
  const venue = await getVenue(venueId);
  if (!venue) notFound();

  const today = todayLocal();
  const todayDow = dayOfWeek(today);
  const events = await getUpcomingEventsForVenue(venue.id, today);
  const verified = lastVerified(venue);
  const srcs = sources(venue);
  const typeLabel = VENUE_TYPES[venue.venue_type ?? ""] ?? "Venue";
  const mapsUrl =
    venue.latitude != null && venue.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`
      : venue.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`
        : null;

  return (
    <div className="wrap">
      <Link href="/" className="back-link">
        Back to search
      </Link>

      <header className="venue-head">
        <h1 className="venue-name">{venue.name}</h1>
        <div className="venue-facts">
          <span>
            {typeLabel}
            {venue.cuisine ? `, ${venue.cuisine}` : ""}
            {venue.neighbourhood?.name ? ` in ${venue.neighbourhood.name}` : ""}
          </span>
          {venue.address && (
            <span>
              {mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  {venue.address}
                </a>
              ) : (
                venue.address
              )}
            </span>
          )}
          {venue.website && (
            <span>
              <a href={venue.website} target="_blank" rel="noopener noreferrer">
                Venue website
              </a>
            </span>
          )}
        </div>
        {venue.venue_sports.length > 0 && (
          <ul className="sports" aria-label="Sports shown" style={{ marginTop: "1rem" }}>
            {venue.venue_sports
              .map((s) => s.sport)
              .sort()
              .map((s) => (
                <li key={s} className="sport">
                  {s}
                </li>
              ))}
          </ul>
        )}
      </header>

      {events.length > 0 && (
        <section className="week" aria-labelledby="events-title">
          <h2 id="events-title" className="section-title">
            Coming up
          </h2>
          {events.map((e) => (
            <div key={e.id} className="week-day">
              <div className="week-day-name">{formatShortDate(localDateOf(e.starts_at))}</div>
              <div>
                {e.title}
                {e.url && (
                  <>
                    {" "}
                    <a className="ticket-link" href={e.url} target="_blank" rel="noopener noreferrer sponsored">
                      Buy tickets
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="week" aria-labelledby="week-title">
        <h2 id="week-title" className="section-title">
          Every week
        </h2>
        {WEEK_ORDER.map((dow) => {
          const specials = venue.specials
            .filter((s) => s.day_of_week === dow)
            .sort((a, b) => (a.start_time ?? "99").localeCompare(b.start_time ?? "99"));
          const ents = venue.entertainment
            .filter((e) => e.day_of_week === dow)
            .sort((a, b) => (a.start_time ?? "99").localeCompare(b.start_time ?? "99"));
          return (
            <div key={dow} className="week-day">
              <div className={dow === todayDow ? "week-day-name today" : "week-day-name"}>
                {WEEKDAYS[dow]}
                {dow === todayDow ? " (today)" : ""}
              </div>
              <div>
                {specials.length === 0 && ents.length === 0 && (
                  <span className="entry-meta">Nothing listed</span>
                )}
                <ul className="lines" style={{ marginTop: 0 }}>
                  {specials.map((s) => {
                    const when = formatTimeRange(s.start_time, s.end_time);
                    return (
                      <li key={`s-${s.id}`}>
                        {when && <span className="line-when">{when}: </span>}
                        {s.description}
                      </li>
                    );
                  })}
                  {ents.map((e) => {
                    const when = formatTime(e.start_time);
                    return (
                      <li key={`e-${e.id}`}>
                        {when && <span className="line-when">{when}: </span>}
                        <span className="line-label">{ENTERTAINMENT_KINDS[e.kind ?? "other"] ?? "Entertainment"}</span>
                        {e.description && e.description !== ENTERTAINMENT_KINDS[e.kind ?? "other"]
                          ? `, ${e.description}`
                          : ""}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </section>

      <section className="provenance">
        <p>
          {verified ? `Last verified ${formatShortDate(verified)}.` : "Not yet verified with the venue."}
          {srcs.length > 0 ? ` Source: ${srcs.join(", ")}.` : ""}
        </p>
        {venue.notes && <p>{venue.notes}</p>}
      </section>
    </div>
  );
}
