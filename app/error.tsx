"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap" style={{ padding: "3rem 1rem" }}>
      <h1 className="section-title">Couldn&rsquo;t load listings</h1>
      <p className="section-intro">{error.message || "The database didn't respond."}</p>
      <button className="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
