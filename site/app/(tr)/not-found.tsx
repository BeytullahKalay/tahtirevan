import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center px-[var(--gutter)] text-center">
      <p className="label">404</p>
      <h1 className="display-md mt-4">Bu taht burada değil.</h1>
      <Link href="/koleksiyonlar" className="link-gold label tap mt-10 !text-fildisi">
        Koleksiyona dön
      </Link>
    </section>
  );
}
