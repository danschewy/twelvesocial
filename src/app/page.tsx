import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          AI Video <span className="text-[hsl(280,100%,70%)]">Clip</span>{" "}
          Generator
        </h1>
        <p className="text-2xl text-center">
          Automatically transform your long-form videos into engaging, shareable
          social media clips using the power of AI.
        </p>
        <Link
          href="/upload" // This will route to src/app/upload/page.tsx
          className="rounded-xl bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
