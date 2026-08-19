import Link from "next/link"
import { NavigationMenu } from "@/components/navigation-menu"
import { AdBanner } from "@/components/ad-banner"
import { ArrowRight, Calendar, BarChart2, Trophy } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <NavigationMenu currentSection="home" />
          <Link href="/" className="text-lg font-black tracking-tight text-white">
            GAA<span className="text-[#e8ff47]">mes</span>quiz
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative border-b border-white/[0.06] px-4 py-20 md:py-32 text-center overflow-hidden">
          {/* Faint grid backdrop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(0 0% 100% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e8ff47]/20 bg-[#e8ff47]/5 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-[#e8ff47] mb-8">
              New question every day
            </span>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white text-balance leading-none mb-6">
              The home of<br />
              <span className="text-[#e8ff47]">rugby &amp; GAA</span><br />
              quiz games
            </h1>

            <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto leading-relaxed mb-10">
              Daily quiz challenges for rugby and GAA fans. Test your knowledge,
              beat the clock, and compete against yourself every day.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/rugby"
                className="inline-flex items-center gap-2 rounded-lg bg-[#e8ff47] px-6 py-3 text-sm font-bold text-black hover:bg-[#d4eb3a] transition-colors"
              >
                Play Rugby
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/gaa"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-6 py-3 text-sm font-bold text-white hover:bg-white/[0.08] transition-colors"
              >
                Play GAA
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Sport cards ── */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            <SportCard
              href="/rugby"
              label="Rugby"
              tagColor="bg-violet-500"
              borderColor="hover:border-violet-500/40"
              games={[
                { name: "TenaBall", desc: "Find all the answers before 3 strikes" },
                { name: "Against the Clock", desc: "Race the timer, score big" },
              ]}
            />
            <SportCard
              href="/gaa"
              label="GAA"
              tagColor="bg-emerald-500"
              borderColor="hover:border-emerald-500/40"
              games={[
                { name: "TenaBall", desc: "Find all the answers before 3 strikes" },
                { name: "Against the Clock", desc: "Race the timer, score big" },
              ]}
            />
          </div>
        </section>

        {/* ── Why play ── */}
        <section className="border-t border-white/[0.06] bg-[#0d0d0d] px-4 py-16 md:py-20">
          <div className="container mx-auto max-w-5xl">
            <p className="text-xs font-bold tracking-widest uppercase text-[#e8ff47] mb-4 text-center">Why play</p>
            <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-12 text-balance">
              Built for serious fans
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <FeatureCard
                icon={<Calendar className="w-5 h-5 text-[#e8ff47]" />}
                title="Daily Challenges"
                desc="Fresh questions drop every day — build a streak and keep your knowledge sharp."
              />
              <FeatureCard
                icon={<BarChart2 className="w-5 h-5 text-[#e8ff47]" />}
                title="Track Progress"
                desc="See your scores improve over time and spot the gaps in your knowledge."
              />
              <FeatureCard
                icon={<Trophy className="w-5 h-5 text-[#e8ff47]" />}
                title="Leaderboards"
                desc="Compare your daily result against other players and claim the top spot."
              />
            </div>
          </div>
        </section>

        {/* ── Ad ── */}
        <div className="container mx-auto px-4 py-8">
          <AdBanner adSlot="YOUR_AD_SLOT_ID_HOMEPAGE" isTestAd={true} />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] px-4 py-8">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <span className="font-black text-sm text-white/60">
            GAA<span className="text-[#e8ff47]">mes</span>quiz
          </span>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SportCard({
  href,
  label,
  tagColor,
  borderColor,
  games,
}: {
  href: string
  label: string
  tagColor: string
  borderColor: string
  games: { name: string; desc: string }[]
}) {
  return (
    <Link href={href}>
      <div
        className={`group relative rounded-xl border border-white/[0.08] bg-[#111] p-6 transition-all duration-200 hover:bg-[#161616] ${borderColor} cursor-pointer`}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${tagColor}`} />
          <span className="text-xs font-bold tracking-widest uppercase text-white/50">{label}</span>
        </div>

        <h3 className="text-2xl font-black text-white mb-1 tracking-tight">{label} Games</h3>
        <p className="text-sm text-white/40 mb-6 leading-relaxed">
          Daily quiz challenges for {label} fans
        </p>

        <div className="space-y-2 mb-6">
          {games.map((g) => (
            <div key={g.name} className="flex items-start gap-3 rounded-lg bg-white/[0.04] px-4 py-3">
              <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#e8ff47] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">{g.name}</p>
                <p className="text-xs text-white/40">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-bold text-[#e8ff47] group-hover:gap-3 transition-all">
          Play now <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8ff47]/10">
        {icon}
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
    </div>
  )
}
