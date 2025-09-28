import Ping from "@/components/Ping";

export default function Page() {
  const db = process.env.DATABASE_URL;
  return (
    <main>
      <h1 className="text-3xl">Env demo</h1>
      <p>Server can see DATABASE_URL: {db ? "yes" : "no"}</p>
      <Ping /> {/* ← this line must exist */}
    </main>
  );
}