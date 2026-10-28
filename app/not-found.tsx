import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "3rem 1rem" }}>
      <h1 className="section-title">That venue isn&rsquo;t listed</h1>
      <p className="section-intro">It may have closed or been removed.</p>
      <Link href="/" className="button" style={{ display: "inline-block", textDecoration: "none" }}>
        Search what&rsquo;s on
      </Link>
    </div>
  );
}
