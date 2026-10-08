import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, FileText, Send, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobCard } from "@/components/jobs/JobCard";
import { affinityScore } from "@/lib/ats";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MatchCV AI" },
      { name: "description", content: "Seu painel de match ATS, candidaturas ativas e vagas recomendadas." },
      { property: "og:title", content: "Dashboard — MatchCV AI" },
      { property: "og:description", content: "Seu painel de match ATS, candidaturas ativas e vagas recomendadas." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { jobs, profile, applications, resumesGenerated } = useStore();
  const ranked = [...jobs].sort((a, b) => affinityScore(b, profile) - affinityScore(a, profile));
  const scored = applications.filter((a) => a.atsScore);
  const avg = scored.length ? Math.round(scored.reduce((s, a) => s + (a.atsScore ?? 0), 0) / scored.length) : 0;
  const metrics = [
    { label: "Match ATS médio", value: `${avg}%`, icon: Target, hl: true },
    { label: "Candidaturas ativas", value: applications.filter((a) => ["Aplicado", "Entrevista"].includes(a.stage)).length, icon: Send },
    { label: "Vagas salvas", value: applications.length, icon: Bookmark },
    { label: "Currículos gerados", value: resumesGenerated, icon: FileText },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="bg-hero flex flex-col gap-4 rounded-2xl border p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Olá, {profile.name.split(" ")[0]} 👋</p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">Seu próximo emprego começa com o currículo certo.</h1>
        </div>
        <Button asChild size="lg" className="shadow-soft">
          <Link to="/vagas"><Sparkles className="h-4 w-4" />Otimizar Currículo para Nova Vaga</Link>
        </Button>
      </section>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className={m.hl ? "border-highlight-border bg-highlight" : ""}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="font-display text-2xl font-bold">{m.value}</p>
              </div>
              <m.icon className={`h-5 w-5 ${m.hl ? "text-highlight-foreground" : "text-primary"}`} />
            </CardContent>
          </Card>
        ))}
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Vagas recomendadas para você</h2>
        <div className="grid gap-4 md:grid-cols-2">{ranked.map((j) => <JobCard key={j.id} job={j} compact />)}</div>
      </section>
    </div>
  );
}
