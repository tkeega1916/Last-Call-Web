import Link from "next/link";
import { VENUE_TYPES, eventLocalTime, type DayResult } from "@/lib/data";
import { addDays, formatLongDate, formatTime, formatTimeRange } from "@/lib/dates";

function dayTag(date: string, today: string): string | null {
  if (date === today) return "Today";
  if (date === addDays(today, 1)) return "Tomorrow";
  return null;
}

const EVENT_KINDS: Record<string, string> = {
  sports: "Game",
  concert: "Concert",
  happy_hour: "Happy hour",
  other: "Event",
};

export default function DayBoard({ days, today }: { days: DayResult[]; today: string }) {
  return (
    <div>
      {days.map((day) => {
        const { weekday, rest } = formatLongDate(day.date);
        const tag = dayTag(day.date, today);
        const empty = day.venues.length === 0 && day.events.length === 0;
        return (
          <section key={day.date} className="day" aria-labelledby={`d-${day.date}`}>
            <h2 id={`d-${day.date}`} className="day-heading">
              <span className="day-weekday">{weekday}</span>
              <span className="day-date">{rest}</span>
              {tag && <span className="day-tag">{tag}</span>}
            </h2>

            {empty && <p className="day-empty">Nothing listed for this day.</p>}

            {day.events.map((e) => {
              const time = formatTime(eventLocalTime(e));
              return (
                <article key={`e-${e.id}`} className="entry">
                  <div className="entry-time">{time}</div>
                  <div>
                    <div className="entry-venue">{e.title}</div>
                    <div className="entry-meta">
                      <span className="event-kind">{EVENT_KINDS[e.category] ?? "Event"}</span>
                      {e.venue_name ? ` at ${e.venue_name}` : null}
                    </div>
                    {e.url && (
                      <a className="ticket-link" href={e.url} target="_blank" rel="noopener noreferrer sponsored">
                        Buy tickets
                      </a>
                    )}
                  </div>
                </article>
              );
            })}

            {day.venues.map(({ venue, firstTime, lines }) => {
              const time = formatTime(firstTime);
              const typeLabel = VENUE_TYPES[venue.venue_type ?? ""] ?? null;
              const where = venue.neighbourhood?.name;
              return (
                <article key={`v-${venue.id}`} className="entry">
                  <div className={time ? "entry-time" : "entry-time unknown"}>{time ?? "Time not listed"}</div>
                  <div>
                    <Link href={`/venues/${venue.id}`} className="entry-venue">
                      {venue.name}
                    </Link>
                    {(typeLabel || where) && (
                      <div className="entry-meta">
                        {typeLabel ?? "Venue"}
                        {where ? ` in ${where}` : ""}
                      </div>
                    )}
                    <ul className="lines">
                      {lines.map((line, i) => {
                        const when = formatTimeRange(line.time, line.endTime);
                        return (
                          <li key={i}>
                            {line.label && <span className="line-label">{line.label}: </span>}
                            {line.text}
                            {when && (lines.length > 1 || line.endTime) && (
                              <span className="line-when"> ({when})</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
