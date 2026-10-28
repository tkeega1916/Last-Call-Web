import { getSupabase } from "./supabase";
import { addDays, dayOfWeek, localDateOf, localTimeOf } from "./dates";

export type City = { id: number; name: string; province_state: string | null; country: string };
export type Neighbourhood = { id: number; city_id: number; name: string };

export type Special = {
  id: number;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  description: string;
  source: string | null;
  last_verified_on: string | null;
};

export type Entertainment = {
  id: number;
  day_of_week: number | null;
  kind: string | null;
  description: string;
  start_time: string | null;
  source: string | null;
  last_verified_on: string | null;
};

export type Venue = {
  id: number;
  city_id: number;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  notes: string | null;
  venue_type: string | null;
  cuisine: string | null;
  neighbourhood_id: number | null;
  neighbourhood: { name: string } | null;
  specials: Special[];
  entertainment: Entertainment[];
  venue_sports: { sport: string }[];
  venue_leagues: VenueLeague[];
};

export type VenueLeague = {
  league: string;
  source: string | null;
  source_url: string | null;
  last_verified_on: string | null;
};

/** Soccer leagues we track per venue. A missing row means "not confirmed". */
export const LEAGUES: { key: string; label: string }[] = [
  { key: "premier_league", label: "Premier League" },
  { key: "la_liga", label: "La Liga" },
  { key: "mls", label: "MLS" },
];

export function showsSoccer(v: Venue): boolean {
  return v.venue_leagues.length > 0 || v.venue_sports.some((s) => s.sport === "Soccer");
}

/** Sports plus confirmed league names, used by the "Shows this sport" filter. */
export function watchOptions(v: Venue): string[] {
  const leagueLabels = v.venue_leagues
    .map((l) => LEAGUES.find((x) => x.key === l.league)?.label)
    .filter((x): x is string => !!x);
  return [...v.venue_sports.map((s) => s.sport), ...leagueLabels];
}

export type EventRow = {
  id: number;
  title: string;
  category: string;
  starts_at: string;
  url: string | null;
  venue_id: number | null;
  venue_name: string | null;
};

export const VENUE_TYPES: Record<string, string> = {
  bar: "Bar",
  pub: "Pub",
  sports_bar: "Sports bar",
  brewpub: "Brewpub",
  restaurant: "Restaurant",
  other: "Venue",
};

export const ENTERTAINMENT_KINDS: Record<string, string> = {
  live_music: "Live music",
  dj: "DJ",
  karaoke: "Karaoke",
  trivia: "Trivia",
  other: "Entertainment",
};

const VENUE_SELECT =
  "id, city_id, name, address, latitude, longitude, website, notes, venue_type, cuisine, neighbourhood_id, neighbourhood:neighbourhoods(name), specials(*), entertainment(*), venue_sports(sport), venue_leagues(league, source, source_url, last_verified_on)";

export async function getCities(): Promise<City[]> {
  const { data, error } = await getSupabase().from("cities").select("*").order("name");
  if (error) throw new Error(`Could not load cities: ${error.message}`);
  return (data ?? []) as City[];
}

export async function getNeighbourhoods(cityId: number): Promise<Neighbourhood[]> {
  const { data, error } = await getSupabase()
    .from("neighbourhoods")
    .select("*")
    .eq("city_id", cityId)
    .order("name");
  if (error) throw new Error(`Could not load neighbourhoods: ${error.message}`);
  return (data ?? []) as Neighbourhood[];
}

export async function getVenues(cityId: number): Promise<Venue[]> {
  const { data, error } = await getSupabase()
    .from("venues")
    .select(VENUE_SELECT)
    .eq("city_id", cityId)
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error(`Could not load venues: ${error.message}`);
  return (data ?? []) as unknown as Venue[];
}

export async function getVenue(id: number): Promise<Venue | null> {
  const { data, error } = await getSupabase()
    .from("venues")
    .select(VENUE_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(`Could not load venue: ${error.message}`);
  return (data as unknown as Venue) ?? null;
}

export async function getEvents(cityId: number, from: string, to: string): Promise<EventRow[]> {
  // Pad by a day each side, then keep only events whose Toronto-local date is in range.
  const { data, error } = await getSupabase()
    .from("events")
    .select("id, title, category, starts_at, url, venue_id, venue_name")
    .eq("city_id", cityId)
    .gte("starts_at", addDays(from, -1) + "T00:00:00Z")
    .lt("starts_at", addDays(to, 2) + "T00:00:00Z")
    .order("starts_at");
  if (error) throw new Error(`Could not load events: ${error.message}`);
  return ((data ?? []) as EventRow[]).filter((e) => {
    const d = localDateOf(e.starts_at);
    return d >= from && d <= to;
  });
}

export async function getUpcomingEventsForVenue(venueId: number, from: string): Promise<EventRow[]> {
  const { data, error } = await getSupabase()
    .from("events")
    .select("id, title, category, starts_at, url, venue_id, venue_name")
    .eq("venue_id", venueId)
    .gte("starts_at", from + "T00:00:00Z")
    .order("starts_at")
    .limit(10);
  if (error) return [];
  return (data ?? []) as EventRow[];
}

// ---------- Building the day-by-day results ----------

export type Category = "specials" | "entertainment" | "events" | "sports";
export const ALL_CATEGORIES: Category[] = ["specials", "entertainment", "events", "sports"];

export type DayLine = {
  kind: "special" | "entertainment";
  time: string | null; // start time, "HH:MM:SS"
  endTime: string | null;
  label: string | null; // e.g. "Trivia"
  text: string;
};

export type VenueDay = { venue: Venue; firstTime: string | null; lines: DayLine[] };
export type DayResult = { date: string; venues: VenueDay[]; events: EventRow[] };

export type Filters = { type?: string; hood?: number; sport?: string };

export function filterVenues(venues: Venue[], f: Filters): Venue[] {
  return venues.filter((v) => {
    if (f.type && v.venue_type !== f.type) return false;
    if (f.hood && v.neighbourhood_id !== f.hood) return false;
    if (f.sport && !watchOptions(v).includes(f.sport)) return false;
    return true;
  });
}

function byTime(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -1 : 1;
}

export function buildDays(
  dates: string[],
  venues: Venue[],
  events: EventRow[],
  show: Set<Category>
): DayResult[] {
  return dates.map((date) => {
    const dow = dayOfWeek(date);
    const venueDays: VenueDay[] = [];

    for (const venue of venues) {
      const lines: DayLine[] = [];
      if (show.has("specials")) {
        for (const s of venue.specials) {
          if (s.day_of_week === dow) {
            lines.push({ kind: "special", time: s.start_time, endTime: s.end_time, label: null, text: s.description });
          }
        }
      }
      if (show.has("entertainment")) {
        for (const e of venue.entertainment) {
          if (e.day_of_week === dow) {
            lines.push({
              kind: "entertainment",
              time: e.start_time,
              endTime: null,
              label: ENTERTAINMENT_KINDS[e.kind ?? "other"] ?? "Entertainment",
              text: e.description,
            });
          }
        }
      }
      if (lines.length) {
        lines.sort((a, b) => byTime(a.time, b.time));
        venueDays.push({ venue, firstTime: lines[0].time, lines });
      }
    }
    venueDays.sort((a, b) => byTime(a.firstTime, b.firstTime) || a.venue.name.localeCompare(b.venue.name));

    const dayEvents = show.has("events") ? events.filter((e) => localDateOf(e.starts_at) === date) : [];
    return { date, venues: venueDays, events: dayEvents };
  });
}

export function eventLocalTime(e: EventRow): string {
  return localTimeOf(e.starts_at);
}

export function lastVerified(venue: Venue): string | null {
  const dates = [...venue.specials, ...venue.entertainment]
    .map((r) => r.last_verified_on)
    .filter((d): d is string => !!d)
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}

export function sources(venue: Venue): string[] {
  const set = new Set<string>();
  for (const r of [...venue.specials, ...venue.entertainment]) if (r.source) set.add(r.source);
  return [...set];
}
