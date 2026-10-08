import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, KanbanSquare, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MatchBadge } from "@/components/ats/ScoreGauge";
import { STAGES, type Application, type Stage } from "@/data/mockData";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/candidaturas")({
  head: () => ({
    meta: [
      { title: "Rastreador de Candidaturas — MatchCV AI" },
      { name: "description", content: "Acompanhe cada candidatura e a versão exata do currículo ATS enviada." },
      { property: "og:title", content: "Rastreador de Candidaturas — MatchCV AI" },
      { property: "og:description", content: "Acompanhe cada candidatura e a versão exata do currículo ATS enviada." },
    ],
  }),
  component: CandidaturasPage,
});

function CandidaturasPage() {
  const { applications, jobs, moveApplication, setSelectedJobId } = useStore();
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [open, setOpen] = useState<Application | null>(null);
  const jobOf = (a: Application) => jobs.find((j) => j.id === a.jobId);

  const CardItem = ({ a }: { a: Application }) => {
    const j = jobOf(a);
    if (!j) return null;
    return (
      <Card className="cursor-pointer transition-shadow hover:shadow-soft" onClick={() => setOpen(a)}>
        <CardContent className="space-y-2 p-3">
          <p className="text-sm font-semibold leading-tight">{j.title}</p>
          <p className="text-xs text-muted-foreground">{j.company}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {a.atsScore != null && <MatchBadge score={a.atsScore} />}
            {a.resumeVersion && <Badge variant="sky" className="gap-1"><FileText className="h-3 w-3" />{a.resumeVersion}</Badge>}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Rastreador de Candidaturas</h1>
          <p className="text-sm text-muted-foreground">Cada card guarda a vaga e a versão exata do currículo ATS.</p>
        </div>
        <div className="flex gap-1 rounded-lg border bg-card p-1">
          <Button size="sm" variant={view === "kanban" ? "default" : "ghost"} onClick={() => setView("kanban")}><KanbanSquare className="h-4 w-4" />Kanban</Button>
          <Button size="sm" variant={view === "lista" ? "default" : "ghost"} onClick={() => setView("lista")}><List className="h-4 w-4" />Lista</Button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STAGES.map((s) => {
            const items = applications.filter((a) => a.stage === s);
            return (
              <div key={s} className="w-64 shrink-0 rounded-xl bg-muted p-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => moveApplication(e.dataTransfer.getData("id"), s)}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-sm font-semibold">{s}</span>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.map((a) => (
                    <div key={a.id} draggable onDragStart={(e) => e.dataTransfer.setData("id", a.id)}><CardItem a={a} /></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card><CardContent className="divide-y p-0">
          {applications.map((a) => {
            const j = jobOf(a);
            return j && (
              <div key={a.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-[200px] flex-1"><p className="font-medium">{j.title}</p><p className="text-xs text-muted-foreground">{j.company} · atualizado {a.updatedAt}</p></div>
                {a.atsScore != null && <MatchBadge score={a.atsScore} />}
                <StageSelect value={a.stage} onChange={(s) => moveApplication(a.id, s)} />
              </div>
            );
          })}
        </CardContent></Card>
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent>
          {open && jobOf(open) && (() => {
            const j = jobOf(open)!;
            const live = applications.find((a) => a.id === open.id) ?? open;
            return (
              <>
                <SheetHeader><SheetTitle>{j.title}</SheetTitle></SheetHeader>
                <div className="mt-4 space-y-4 text-sm">
                  <p className="text-muted-foreground">{j.company} · {j.location} · {j.mode}</p>
                  <StageSelect value={live.stage} onChange={(s) => moveApplication(live.id, s)} />
                  <div className="rounded-lg border bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Versão do currículo</p>
                    <p className="font-medium">{live.resumeVersion ?? "Nenhuma versão gerada ainda"}</p>
                    {live.atsScore != null && <p className="mt-1">Score ATS: <b>{live.atsScore}</b></p>}
                  </div>
                  <Button asChild className="w-full" onClick={() => setSelectedJobId(j.id)}><Link to="/estudio">Abrir no Estúdio ATS</Link></Button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StageSelect({ value, onChange }: { value: Stage; onChange: (s: Stage) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Stage)}>
      <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
      <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
    </Select>
  );
}
