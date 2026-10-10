import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, FileDown, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScoreGauge } from "@/components/ats/ScoreGauge";
import { ResumePreview } from "@/components/resume/ResumePreview";
import type { Profile } from "@/data/mockData";
import { atsChecklist, keywordMatch, optimizeResume, resumeToText } from "@/lib/ats";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/estudio")({
  head: () => ({
    meta: [
      { title: "Estúdio ATS & Otimizador — MatchCV AI" },
      { name: "description", content: "Compare vaga e currículo lado a lado e gere uma versão otimizada para ATS." },
      { property: "og:title", content: "Estúdio ATS & Otimizador — MatchCV AI" },
      { property: "og:description", content: "Compare vaga e currículo lado a lado e gere uma versão otimizada para ATS." },
    ],
  }),
  component: EstudioPage,
});

function EstudioPage() {
  const { jobs, profile, selectedJobId, setSelectedJobId, upsertApplication, incResumes, applications, hydrated } = useStore();
  const job = jobs.find((j) => j.id === selectedJobId) ?? jobs[0]!;
  const app = applications.find((a) => a.jobId === job.id);
  const [optimized, setOptimized] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  // Restore the saved ATS version linked to this job's application
  useEffect(() => {
    setOptimized(app?.resume && app.resume.id === profile.id ? app.resume : null);
    setShowBefore(false);
  }, [job.id, profile.id, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = optimized && !showBefore ? optimized : profile;
  const diag = useMemo(() => atsChecklist(current, job), [current, job]);
  const baseScore = useMemo(() => atsChecklist(profile, job).score, [profile, job]);
  const jdFound = diag.found;

  const persist = (o: Profile, label?: string) =>
    upsertApplication(job.id, {
      ...(label ? { stage: app && app.stage !== "Salva" ? app.stage : "Currículo Gerado", resumeVersion: label } : {}),
      atsScore: atsChecklist(o, job).score,
      resume: o,
    });

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      const o = optimizeResume(profile, job);
      setOptimized(o); setLoading(false); incResumes();
      const n = (app?.resumeVersion?.match(/^v(\d+)/)?.[1] ?? "0");
      persist(o, `v${Number(n) + 1} – ${job.company}`);
      toast.success("Currículo otimizado com sucesso!");
    }, 1600);
  };

  const update = (o: Profile) => { setOptimized(o); persist(o); };
  const editSummary = (summary: string) => optimized && update({ ...optimized, summary });

  const insertTerm = (term: string, where: "skills" | "bullet") => {
    const base = optimized ?? structuredClone(profile);
    const next: Profile =
      where === "skills"
        ? { ...base, skills: [...base.skills, term] }
        : { ...base, experiences: base.experiences.map((e, i) => (i === 0 ? { ...e, bullets: [...e.bullets, suggestionFor(term)] } : e)) };
    if (!optimized) persist(next, `v${Number(app?.resumeVersion?.match(/^v(\d+)/)?.[1] ?? 0) + 1} – ${job.company}`);
    else persist(next);
    setOptimized(next); setShowBefore(false);
    toast.success(`"${term}" inserido no currículo`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Estúdio ATS & Otimizador</h1>
          <p className="text-sm text-muted-foreground">Currículo de {profile.name} vs. vaga selecionada.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={job.id} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-[260px] bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>{jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title} · {j.company}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={generate} disabled={loading}><Sparkles className="h-4 w-4" />{loading ? "Analisando..." : "Gerar Versão ATS"}</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr_300px]">
        <Card className="no-print h-fit">
          <CardHeader><CardTitle className="text-base">{job.title}</CardTitle><p className="text-sm text-muted-foreground">{job.company}</p></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Palavras-chave identificadas</p>
              <div className="flex flex-wrap gap-1.5">
                {job.keywords.map((k) => (
                  <Badge key={k} variant={jdFound.includes(k) ? "highlight" : "outline"}>
                    {jdFound.includes(k) ? "✓ " : ""}{k}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-secondary-foreground">{job.description}</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="no-print flex items-center justify-between border-b bg-muted px-4 py-2">
            <span className="text-sm font-medium">{optimized ? (showBefore ? "Antes (currículo base)" : "Depois (versão ATS)") : "Currículo base"}</span>
            {optimized && (
              <div className="flex items-center gap-2 text-sm">
                <Label htmlFor="ba">Ver antes</Label>
                <Switch id="ba" checked={showBefore} onCheckedChange={setShowBefore} />
              </div>
            )}
          </div>
          {loading ? (
            <div className="space-y-3 p-8">
              <Skeleton className="mx-auto h-6 w-48" /><Skeleton className="mx-auto h-3 w-72" />
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
            </div>
          ) : (
            <>
              {optimized && !showBefore && (
                <div className="no-print space-y-1.5 border-b bg-accent/50 p-4">
                  <Label className="text-xs">Editar resumo sugerido pela IA</Label>
                  <Textarea rows={3} className="bg-card" value={optimized.summary} onChange={(e) => editSummary(e.target.value)} />
                </div>
              )}
              <ResumePreview profile={current} highlight={optimized && !showBefore ? diag.found : []} />
            </>
          )}
        </Card>

        <div className="no-print space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-5">
              <ScoreGauge score={diag.score} />
              {optimized && <p className="text-xs text-muted-foreground">Antes: {baseScore} → <span className="font-semibold text-foreground">{atsChecklist(optimized, job).score}</span></p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Checklist ATS</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {diag.checks.map((c) => (
                <div key={c.label} className="flex items-start gap-2 text-sm">
                  {c.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-highlight-strong" />}
                  <span>{c.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Keywords Críticas Encontradas</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {diag.found.length ? diag.found.map((k) => <Badge key={k} variant="sky">✓ {k}</Badge>) : <p className="text-xs text-muted-foreground">Nenhuma ainda.</p>}
            </CardContent>
          </Card>
          {diag.missing.length > 0 && (
            <Card className="border-highlight-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Keywords Recomendadas Ausentes</CardTitle>
                <p className="text-xs text-muted-foreground">Clique para inserir no currículo.</p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {diag.missing.map((m) => (
                  <Popover key={m}>
                    <PopoverTrigger asChild>
                      <button type="button"><Badge variant="highlight" className="cursor-pointer hover:bg-highlight-border">+ {m}</Badge></button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 space-y-3">
                      <p className="text-sm font-semibold">Inserir “{m}”</p>
                      <p className="rounded-md bg-muted p-2 text-xs italic text-secondary-foreground">{suggestionFor(m)}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => insertTerm(m, "bullet")}>Inserir frase</Button>
                        <Button size="sm" variant="outline" onClick={() => insertTerm(m, "skills")}>Só habilidade</Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Só inclua termos que você realmente domina.</p>
                    </PopoverContent>
                  </Popover>
                ))}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="space-y-2 p-4">
              <Dialog>
                <DialogTrigger asChild><Button variant="outline" className="w-full">Pré-visualizar exportação</Button></DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                  <DialogHeader><DialogTitle>Template clássico ATS</DialogTitle></DialogHeader>
                  <ResumePreview profile={current} />
                </DialogContent>
              </Dialog>
              <Button className="w-full" onClick={() => window.print()}><FileDown className="h-4 w-4" />Exportar PDF</Button>
              <Button variant="secondary" className="w-full" onClick={() => { navigator.clipboard.writeText(resumeToText(current)); toast.success("Copiado para a área de transferência"); }}>
                <Copy className="h-4 w-4" />Copiar texto (Gupy, Workday...)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
