import Link from "next/link";
import {
  ALL_CATEGORIES,
  VENUE_TYPES,
  buildDays,
  filterVenues,
  getCities,
  getEvents,
  getNeighbourhoods,
  getVenues,
  watchOptions,
  type Category,
  type Venue,
} from "@/lib/data";
import { MAX_RANGE_DAYS, addDays, datesBetween, isIsoDate, todayLocal } from "@/lib/dates";
import SearchForm from "@/components/SearchForm";
import DayBoard from "@/components/DayBoard";
import WhereToWatch from "@/components/WhereToWatch";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function all(v: string | string[] | undefined): string[] {
  return v === undefined ? [] : Array.isArray(v) ? v : [v];
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const cities = await getCities();
  if (cities.length === 0) {
    return (
      <div className="wrap">
        <p className="notice">No cities are set up yet.</p>
      </div>
    );
  }

  const cityParam = Number(first(params.city));
  const city = cities.find((c) => c.id === cityParam) ?? cities.find((c) => c.name === "Toronto") ?? cities[0];

  const today = todayLocal();
  let from = isIsoDate(first(params.from)) ? (first(params.from) as string) : today;
  let to = isIsoDate(first(params.to)) ? (first(params.to) as string) : addDays(from, 6);
  if (to < from) [from, to] = [to, from];
  const dates = datesBetween(from, to);
  const rangeWasCapped = dates[dates.length - 1] !== to;
  if (rangeWasCapped) to = dates[dates.length - 1];

  const requested = all(params.show).filter((s): s is Category => (ALL_CATEGORIES as string[]).includes(s));
  const show = new Set<Category>(requested.length ? requested : ALL_CATEGORIES);

  const type = first(params.type) && VENUE_TYPES[first(params.type) as string] ? first(params.type) : undefined;
  const hood = Number(first(params.hood)) || undefined;
  const sport = first(params.sport) || undefined;

  const [neighbourhoods, venues, events] = await Promise.all([
    getNeighbourhoods(city.id),
    getVenues(city.id),
    show.has("events") ? getEvents(city.id, from, to) : Promise.resolve([]),
  ]);

  const sportsOffered = [...new Set(venues.flatMap((v: Venue) => watchOptions(v)))].sort();
  const typesOffered = [...new Set(venues.map((v) => v.venue_type).filter((t): t is string => !!t))].sort(
    (a, b) => (VENUE_TYPES[a] ?? a).localeCompare(VENUE_TYPES[b] ?? b)
  );

  const filtered = filterVenues(venues, { type, hood, sport });
  const days = buildDays(dates, filtered, events, show);
  const hasVenueDays = days.some((d) => d.venues.length > 0 || d.events.length > 0);
  const hasDayContent = (show.has("specials") || show.has("entertainment") || show.has("events")) && hasVenueDays;
  const onlyEvents = show.has("events") && !show.has("specials") && !show.has("entertainment");

  return (
    <>
      <SearchForm
        cities={cities}
        cityId={city.id}
        from={from}
        to={to}
        show={show}
        type={type}
        hood={hood}
        sport={sport}
        neighbourhoods={neighbourhoods}
        types={typesOffered}
        sports={sportsOffered}
      />

      <div className="wrap">
        {rangeWasCapped && (
          <p className="notice">Showing the first {MAX_RANGE_DAYS} days. Pick a shorter range to see other dates.</p>
        )}
        {show.has("events") && events.length === 0 && (
          onlyEvents ? (
            <section className="day">
              <h2 className="section-title">Games and concerts are coming soon</h2>
              <p className="section-intro">
                Ticketed sports games and concerts aren&rsquo;t connected yet. Until then, turn on Happy hours,
                Trivia, music &amp; karaoke, or Where to watch sports to see what&rsquo;s on at bars.
              </p>
            </section>
          ) : (
            <p className="notice">
              Games and concerts aren&rsquo;t connected yet. Bar specials and entertainment are shown below.
            </p>
          )
        )}
        {filtered.length === 0 && (
          <p className="notice">
            No venues match these filters. <Link href={`/?city=${city.id}`}>Clear filters</Link>
          </p>
        )}

        {hasDayContent && filtered.length > 0 && <DayBoard days={days} today={today} />}

        {show.has("sports") && filtered.length > 0 && <WhereToWatch venues={filtered} sport={sport} />}
      </div>
    </>
  );
}
