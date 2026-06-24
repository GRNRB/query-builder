import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <span className="mb-4 rounded-full border px-3 py-1 text-xs font-medium text-fd-muted-foreground">
        @grnrb/query-builder
      </span>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        Structured query &amp; filter trees, fully typed.
      </h1>
      <p className="mt-5 max-w-xl text-fd-muted-foreground">
        A framework-agnostic core for building nested condition/group trees — immutable
        helpers, a schema with operator arity, and a reducer — plus a{' '}
        <code className="text-fd-foreground">useQueryBuilder</code> React hook with full
        TypeScript inference from your schema.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/docs"
          className="rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground"
        >
          Get started
        </Link>
        <Link
          href="/docs/getting-started/playground"
          className="rounded-lg border px-5 py-2.5 text-sm font-medium"
        >
          Live playground
        </Link>
        <a
          href="https://github.com/GRNRB/query-builder"
          className="rounded-lg border px-5 py-2.5 text-sm font-medium"
        >
          GitHub
        </a>
      </div>
    </main>
  );
}
