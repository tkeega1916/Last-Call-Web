import { LEAGUES, type Venue } from "@/lib/data";

/** Shows each tracked soccer league as "Shows it" (with source) or "Not confirmed". */
export default function LeagueList({ venue, withSources = false }: { venue: Venue; withSources?: boolean }) {
  return (
    <ul className="leagues" aria-label="Soccer leagues">
      {LEAGUES.map(({ key, label }) => {
        const row = venue.venue_leagues.find((l) => l.league === key);
        return (
          <li key={key} className={row ? "league yes" : "league unknown"}>
            <span className="league-name">{label}</span>
            <span className="league-status">{row ? "Shows it" : "Not confirmed"}</span>
            {withSources && row?.source && (
              <span className="league-source">
                {row.source_url ? (
                  <a href={row.source_url} target="_blank" rel="noopener noreferrer">
                    {row.source}
                  </a>
                ) : (
                  row.source
                )}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
