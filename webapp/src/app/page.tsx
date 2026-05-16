import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { withAuth } from "@/components/with-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const headlineFont = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

function Home() {
    const features = [
        {
            title: "Write before you organize",
            description:
                "Capture loose thoughts, rough bullets, and half-formed ideas without breaking your flow.",
        },
        {
            title: "See the signal quickly",
            description:
                "Drift turns scattered notes into a clean daily digest with themes, actions, and follow-ups.",
        },
        {
            title: "Stay close to the work",
            description:
                "Your notes, summaries, and next steps live in one place instead of across tabs and tools.",
        },
    ];

    const workflow = [
        {
            step: "01",
            title: "Capture as you think",
            description:
                "Use a lightweight writing surface for meeting notes, planning fragments, and personal logs.",
        },
        {
            step: "02",
            title: "Generate a daily digest",
            description:
                "Pull the important through-lines into a short summary you can revisit later.",
        },
        {
            step: "03",
            title: "Turn notes into motion",
            description:
                "Extract next steps, corrections, and follow-up questions without rewriting everything yourself.",
        },
    ];

    const reassurance = [
        "Built for messy notes, not pristine docs.",
        "A lightweight daily workflow instead of another heavy workspace.",
        "Summaries help you recover context fast after a busy day.",
        "Simple structure now, room for deeper AI workflows later.",
    ];

    return (
        <main className="min-h-svh bg-background text-foreground">
            <div className="relative isolate overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-background" />
                <header className="sticky top-0 z-30 bg-transparent">
                    <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-6 lg:px-10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/55 text-sm font-semibold text-foreground backdrop-blur">
                                D
                            </div>
                            <div>
                                <p className="font-semibold">Drift</p>
                                <p className="text-xs text-muted-foreground">AI-powered note capture</p>
                            </div>
                        </Link>
                        <nav className="flex items-center gap-3">
                            <Button asChild variant="ghost" className="rounded-full bg-background/35 backdrop-blur hover:bg-background/55">
                                <Link href="/auth/sign-in">Sign in</Link>
                            </Button>
                            <Button asChild className="rounded-full">
                                <Link href="/auth/sign-up">Get started</Link>
                            </Button>
                        </nav>
                    </div>
                </header>

                <div className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-16 lg:px-10">
                    <section className="relative flex h-[50dvh] min-h-[420px] flex-col justify-center overflow-hidden">
                        <div className="pointer-events-none absolute inset-x-[8%] top-[10%] -z-10 h-[72%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.16),rgba(99,102,241,0.08),transparent_72%)] blur-3xl" />
                        <div className="pointer-events-none absolute left-[12%] top-[18%] -z-10 h-52 w-72 rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.18),rgba(244,114,182,0.02),transparent_72%)] blur-3xl animate-pulse [animation-duration:7s]" />
                        <div className="pointer-events-none absolute right-[10%] top-[14%] -z-10 h-56 w-80 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.18),rgba(59,130,246,0.03),transparent_74%)] blur-3xl animate-pulse [animation-delay:1200ms] [animation-duration:8s]" />
                        <div className="pointer-events-none absolute inset-x-0 top-[28%] -z-10 mx-auto h-36 max-w-2xl rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.72),transparent_74%)] blur-2xl" />
                        <div className="relative z-10 flex max-w-4xl flex-col items-start gap-7 text-left">
                            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                                Daily notes, clearer decisions
                            </Badge>
                            <div className="space-y-6">
                                <h1 className={`${headlineFont.className} text-5xl leading-[0.94] tracking-tight sm:text-6xl lg:text-8xl`}>
                                    Capture the mess. Keep the meaning.
                                </h1>
                                <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                                    Drift gives you a focused place to write first and organize later,
                                    with AI summaries that turn scattered notes into a usable daily narrative.
                                </p>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 -z-10 scale-[2.4] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22),rgba(59,130,246,0.08),transparent_72%)] blur-2xl" />
                                <div className="absolute inset-x-3 top-1 -z-10 h-6 rounded-full bg-white/40 blur-xl" />
                                <Button
                                    asChild
                                    size="lg"
                                    className="group relative h-13 overflow-hidden rounded-full border border-white/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(233,213,255,0.95)_34%,rgba(196,181,253,1)_62%,rgba(125,211,252,0.96))] px-8 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-18px_rgba(99,102,241,0.65)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-20px_rgba(99,102,241,0.75)]"
                                >
                                    <Link href="/auth/sign-up">Start for free</Link>
                                </Button>
                                <div className="pointer-events-none absolute inset-[1px] rounded-full border border-white/40" />
                                <div className="pointer-events-none absolute inset-x-8 top-[3px] h-1/2 rounded-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0.95),rgba(255,255,255,0.14),transparent)] opacity-80" />
                            </div>
                        </div>
                    </section>

                    <section className="pb-8">
                        <Card className="overflow-hidden border-border/70 bg-card/40 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.45)]">
                            <CardContent className="min-h-[480px] p-0 lg:min-h-[560px]">
                                <div className="grid min-h-[480px] lg:min-h-[560px] lg:grid-cols-[1.15fr_0.85fr]">
                                    <div className="border-b border-border/70 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold">Product demo</p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Placeholder preview of the intake and summary workflow.
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="rounded-full">
                                                Notes
                                            </Badge>
                                        </div>
                                        <div className="mt-8 space-y-4">
                                            {[
                                                "Roadmap call kept circling back to onboarding friction for new users.",
                                                "Need a cleaner way to track follow-ups from customer interviews.",
                                                "Weekly planning feels fragmented across notes, todo list, and chat threads.",
                                                "Would be useful if the summary surfaced unresolved questions automatically.",
                                            ].map((line, index) => (
                                                <div
                                                    key={line}
                                                    className="rounded-2xl border border-border/60 bg-background/80 px-4 py-4 text-sm leading-7 text-foreground shadow-sm"
                                                >
                                                    <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                        <span>{`Line ${index + 1}`}</span>
                                                        <span className="h-px flex-1 bg-border/70" />
                                                    </div>
                                                    <p>{line}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-muted/20 p-6 sm:p-8">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold">Daily digest</p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Dummy AI output for the same note set.
                                                </p>
                                            </div>
                                            <Badge className="rounded-full">Summary</Badge>
                                        </div>
                                        <div className="mt-8 space-y-4">
                                            {[
                                                {
                                                    title: "Main theme",
                                                    text: "The team needs a tighter workflow for turning raw notes into visible next steps.",
                                                },
                                                {
                                                    title: "Action item",
                                                    text: "Prototype a lightweight intake page that pairs writing with an immediate summary view.",
                                                },
                                                {
                                                    title: "Open question",
                                                    text: "How much structure should be automatic versus user-controlled in the daily digest?",
                                                },
                                            ].map((item) => (
                                                <div
                                                    key={item.title}
                                                    className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-sm"
                                                >
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                        {item.title}
                                                    </p>
                                                    <p className="mt-3 text-sm leading-7 text-foreground">
                                                        {item.text}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <Separator className="my-6" />
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {["4 source notes", "3 extracted insights", "1 next action", "0 manual cleanup"].map((stat) => (
                                                <div
                                                    key={stat}
                                                    className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground"
                                                >
                                                    {stat}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="py-10">
                        <div className="max-w-2xl">
                            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                                Why Drift
                            </Badge>
                            <h2 className={`${headlineFont.className} mt-5 text-4xl leading-tight tracking-tight sm:text-5xl`}>
                                A calmer way to move from notes to clarity.
                            </h2>
                            <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
                                Drift is designed for people who think in drafts first. You write in
                                plain language, then let the product pull out the useful shape.
                            </p>
                        </div>
                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            {features.map((feature) => (
                                <Card key={feature.title} className="border-border/70 bg-card/50 shadow-none">
                                    <CardContent className="p-6">
                                        <p className="text-base font-semibold">{feature.title}</p>
                                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section className="py-10">
                        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                            <div className="max-w-md">
                                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                                    Workflow
                                </Badge>
                                <h2 className={`${headlineFont.className} mt-5 text-4xl leading-tight tracking-tight sm:text-5xl`}>
                                    Keep the process short enough to use every day.
                                </h2>
                                <p className="mt-4 text-base leading-8 text-muted-foreground">
                                    The product should feel light when you are capturing thoughts and
                                    more structured only when you need a usable summary.
                                </p>
                            </div>
                            <div className="grid gap-4">
                                {workflow.map((item) => (
                                    <Card key={item.step} className="border-border/70 bg-card/45 shadow-none">
                                        <CardContent className="flex gap-4 p-5 sm:p-6">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-sm font-semibold">
                                                {item.step}
                                            </div>
                                            <div>
                                                <p className="text-base font-semibold">{item.title}</p>
                                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-10">
                        <Card className="border-border/70 bg-muted/25 shadow-none">
                            <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                                <div>
                                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                                        Reassurance
                                    </Badge>
                                    <h2 className={`${headlineFont.className} mt-5 text-4xl leading-tight tracking-tight sm:text-5xl`}>
                                        Useful even when your notes are still rough.
                                    </h2>
                                </div>
                                <div className="grid gap-3">
                                    {reassurance.map((item) => (
                                        <div
                                            key={item}
                                            className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 text-sm leading-7 text-muted-foreground"
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="py-10 pb-20">
                        <Card className="overflow-hidden border-border/70 bg-card/60 shadow-[0_24px_80px_-48px_rgba(99,102,241,0.45)]">
                            <CardContent className="relative px-6 py-10 sm:px-8 sm:py-12">
                                <div className="pointer-events-none absolute inset-x-[20%] top-0 h-24 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.16),transparent_72%)] blur-3xl" />
                                <div className="relative z-10 max-w-3xl">
                                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                                        Start now
                                    </Badge>
                                    <h2 className={`${headlineFont.className} mt-5 text-4xl leading-tight tracking-tight sm:text-5xl`}>
                                        Write with less friction. Revisit your day with more context.
                                    </h2>
                                    <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                                        Use placeholder notes today, evolve the workflow tomorrow, and
                                        keep the writing surface simple enough that you actually return to it.
                                    </p>
                                    <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                                        <Button asChild size="lg" className="rounded-full px-7">
                                            <Link href="/auth/sign-up">Create your workspace</Link>
                                        </Button>
                                        <Button asChild variant="ghost" size="lg" className="rounded-full">
                                            <Link href="/auth/sign-in">I already have an account</Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default withAuth(Home, { redirectTo: "/intake", invert: true });
