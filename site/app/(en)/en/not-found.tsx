import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center px-[var(--gutter)] text-center">
      <p className="label">404</p>
      <h1 className="display-md mt-4">This throne is not here.</h1>
      <Link href="/en/collections" className="link-gold label tap mt-10 !text-fildisi">
        Back to the collection
      </Link>
    </section>
  );
}
