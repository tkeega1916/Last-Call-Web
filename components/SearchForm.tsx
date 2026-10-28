import Link from "next/link";
import { VENUE_TYPES, type Category, type City, type Neighbourhood } from "@/lib/data";

const CATEGORY_LABELS: { value: Category; label: string }[] = [
  { value: "specials", label: "Happy hours" },
  { value: "entertainment", label: "Trivia, music & karaoke" },
  { value: "events", label: "Games & concerts" },
  { value: "sports", label: "Where to watch sports" },
];

type Props = {
  cities: City[];
  cityId: number;
  from: string;
  to: string;
  show: Set<Category>;
  type?: string;
  hood?: number;
  sport?: string;
  neighbourhoods: Neighbourhood[];
  types: string[];
  sports: string[];
};

export default function SearchForm(p: Props) {
  const filtersActive = !!(p.type || p.hood || p.sport);
  return (
    <section className="search">
      <form className="wrap" method="get" action="/">
        <h1 className="search-sentence">
          What&rsquo;s on in{" "}
          <label className="sr-only" htmlFor="city">
            City
          </label>
          <select id="city" name="city" defaultValue={p.cityId} className="inline-field">
            {p.cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>{" "}
          from{" "}
          <label className="sr-only" htmlFor="from">
            Start date
          </label>
          <input id="from" name="from" type="date" defaultValue={p.from} className="inline-field" required />{" "}
          to{" "}
          <label className="sr-only" htmlFor="to">
            End date
          </label>
          <input id="to" name="to" type="date" defaultValue={p.to} className="inline-field" required />
        </h1>

        <fieldset className="toggles">
          <legend className="sr-only">What to show</legend>
          {CATEGORY_LABELS.map((c) => (
            <label key={c.value} className="toggle">
              <input type="checkbox" name="show" value={c.value} defaultChecked={p.show.has(c.value)} />
              <span>{c.label}</span>
            </label>
          ))}
        </fieldset>

        <details className="more-filters" open={filtersActive}>
          <summary>Filter by neighbourhood, venue type or sport</summary>
          <div className="filter-row">
            <label>
              Neighbourhood
              <select name="hood" defaultValue={p.hood ?? ""}>
                <option value="">Anywhere</option>
                {p.neighbourhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Venue type
              <select name="type" defaultValue={p.type ?? ""}>
                <option value="">Any type</option>
                {p.types.map((t) => (
                  <option key={t} value={t}>
                    {VENUE_TYPES[t] ?? t}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Shows this sport
              <select name="sport" defaultValue={p.sport ?? ""}>
                <option value="">Any sport</option>
                {p.sports.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>

        <div className="search-actions">
          <button type="submit" className="button">
            Show what&rsquo;s on
          </button>
          {filtersActive && (
            <Link href={`/?city=${p.cityId}&from=${p.from}&to=${p.to}`} className="reset-link">
              Clear filters
            </Link>
          )}
        </div>
      </form>
    </section>
  );
}
