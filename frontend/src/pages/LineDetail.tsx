import { Link, useParams } from "react-router-dom";

export function LineDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <section>
      <Link
        to="/"
        className="mb-4 inline-block text-sm text-gray-400 hover:text-white"
      >
        ← Back to dashboard
      </Link>
      <h2 className="text-2xl font-semibold">
        Line {id} (metrics and charts coming next)
      </h2>
    </section>
  );
}
