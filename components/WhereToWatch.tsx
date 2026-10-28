import Link from "next/link";
import { VENUE_TYPES, showsSoccer, type Venue } from "@/lib/data";
import LeagueList from "@/components/LeagueList";

export default function WhereToWatch({ venues, sport }: { venues: Venue[]; sport?: string }) {
  const showing = venues
    .filter((v) => v.venue_sports.length > 0)
    .sort((a, b) => b.venue_sports.length - a.venue_sports.length || a.name.localeCompare(b.name));

  if (showing.length === 0) return null;

  return (
    <section className="watch" aria-labelledby="watch-title">
      <h2 id="watch-title" className="section-title">
        {sport ? `Where to watch ${sport}` : "Where to watch the game"}
      </h2>
      <p className="section-intro">
        Bars that regularly show these sports. Big games fill up, so call ahead if you need a table.
      </p>
      <ul className="watch-list">
        {showing.map((v) => (
          <li key={v.id} className="watch-item">
            <Link href={`/venues/${v.id}`} className="entry-venue">
              {v.name}
            </Link>
            <div className="entry-meta">
              {VENUE_TYPES[v.venue_type ?? ""] ?? "Venue"}
              {v.neighbourhood?.name ? ` in ${v.neighbourhood.name}` : ""}
            </div>
            <ul className="sports" aria-label="Sports shown">
              {v.venue_sports
                .map((s) => s.sport)
                .sort()
                .map((s) => (
                  <li key={s} className="sport">
                    {s}
                  </li>
                ))}
            </ul>
            {showsSoccer(v) && <LeagueList venue={v} />}
          </li>
        ))}
      </ul>
    </section>
  );
}
