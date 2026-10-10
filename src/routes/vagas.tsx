import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JobCard } from "@/components/jobs/JobCard";
import type { Job } from "@/data/mockData";
import { affinityScore } from "@/lib/ats";
import { extractKeywords } from "@/lib/keywords";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/vagas")({
  head: () => ({
    meta: [
      { title: "Matchmaker de Vagas — MatchCV AI" },
      { name: "description", content: "Cole uma vaga ou filtre oportunidades e veja seu score de afinidade." },
      { property: "og:title", content: "Matchmaker de Vagas — MatchCV AI" },
      { property: "og:description", content: "Cole uma vaga ou filtre oportunidades e veja seu score de afinidade." },
    ],
  }),
  component: VagasPage,
});

function VagasPage() {
  const { jobs, addJob, profile, setSelectedJobId } = useStore();
  const nav = useNavigate();
  const [jd, setJd] = useState("");
  const [q, setQ] = useState("");
  const [sen, setSen] = useState("all");
  const [mode, setMode] = useState("all");
  const [area, setArea] = useState("all");

  const analyze = () => {
    if (jd.trim().length < 30) { toast.error("Cole a descrição completa da vaga (ou URL + descrição)"); return; }
    const extracted = extractKeywords(jd, 16);
    const keywords = extracted.map((k) => k.term);
    const title = jd.split("\n").find((l) => l.trim())?.slice(0, 70) ?? "Vaga externa";
    const job: Job = {
      id: crypto.randomUUID(), title, company: "Vaga externa", location: "—",
      seniority: /s[eê]nior/i.test(jd) ? "Sênior" : /j[uú]nior/i.test(jd) ? "Júnior" : "Pleno",
      mode: /remot/i.test(jd) ? "Remoto" : /h[ií]brid/i.test(jd) ? "Híbrido" : "Presencial",
      area: "Externa", salary: "A combinar", description: jd,
      required: extracted.filter((k) => k.weight >= 0.5).map((k) => k.term).slice(0, 6),
      niceToHave: extracted.filter((k) => k.weight < 0.5).map((k) => k.term).slice(0, 6),
      benefits: [], keywords: keywords.length ? keywords : ["Comunicação"],
    };
    addJob(job); setSelectedJobId(job.id); setJd("");
    toast.success(`Vaga analisada: ${affinityScore(job, profile)}% de afinidade`);
    nav({ to: "/estudio" });
  };

  const list = jobs
    .filter((j) => (sen === "all" || j.seniority === sen) && (mode === "all" || j.mode === mode) && (area === "all" || j.area === area))
    .filter((j) => !q || (j.title + j.company + j.keywords.join(" ")).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => affinityScore(b, profile) - affinityScore(a, profile));
  const areas = [...new Set(jobs.map((j) => j.area))];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Matchmaker de Vagas</h1>
        <p className="text-sm text-muted-foreground">Cole uma vaga externa ou explore as recomendadas.</p>
      </div>
      <Card className="border-accent bg-hero">
        <CardContent className="space-y-3 p-5">
          <Textarea rows={5} placeholder="Cole a URL e/ou a descrição completa da vaga (Job Description)..." value={jd} onChange={(e) => setJd(e.target.value)} className="bg-card" />
          <Button onClick={analyze}><Wand2 className="h-4 w-4" />Analisar vaga e abrir no Estúdio</Button>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="bg-card pl-9" placeholder="Buscar por cargo, empresa ou stack" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Filter value={sen} onChange={setSen} placeholder="Senioridade" options={["Júnior", "Pleno", "Sênior"]} />
        <Filter value={mode} onChange={setMode} placeholder="Regime" options={["Remoto", "Híbrido", "Presencial"]} />
        <Filter value={area} onChange={setArea} placeholder="Área" options={areas} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((j) => <JobCard key={j.id} job={j} />)}
        {!list.length && <p className="text-sm text-muted-foreground">Nenhuma vaga com esses filtros.</p>}
      </div>
    </div>
  );
}

function Filter({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[150px] bg-card"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}: todos</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
