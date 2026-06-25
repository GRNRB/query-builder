import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Playground } from "@/components/playground";
import { GitHubStars } from "@/components/github-stars";
import { gitConfig } from "@/lib/shared";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-16 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left — pitch */}
        <div className="flex flex-col items-start text-left">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Query Builder
          </h1>
          <p className="mt-3 text-xl font-medium text-fd-muted-foreground sm:text-2xl">
            Build the query builder you actually designed.
          </p>
          <p className="mt-6 max-w-xl text-fd-muted-foreground">
            query-builder is the headless engine for nested conditions, groups,
            operators, arity, immutable trees, and a typed reducer. It gives you
            the hard parts of a filter UI — building, mutating, and serializing
            the query — without taking over your markup.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs/framework/react"
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              <BookOpen className="size-4" />
              Read the docs
            </Link>
            <GitHubStars user={gitConfig.user} repo={gitConfig.repo} />
          </div>
        </div>

        {/* Right — live playground */}
        <div className="w-full min-w-0">
          <Playground showJson={false} />
        </div>
      </div>
    </main>
  );
}
