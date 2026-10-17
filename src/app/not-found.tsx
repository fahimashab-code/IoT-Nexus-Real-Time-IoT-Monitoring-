import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="panel large-empty">
      <span className="section-kicker">404 / PAGE NOT FOUND</span>
      <h1>This page isn’t on the bench.</h1>
      <p>The workspace has been simplified. Continue to the motor test bench.</p>
      <Link href="/" className="button button-primary">
        <ArrowLeft size={16} />
        Back to the bench
      </Link>
    </section>
  );
}
