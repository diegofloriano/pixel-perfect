import { Link } from "@tanstack/react-router";
import { Bookmark, MapPin, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MatchBadge } from "@/components/ats/ScoreGauge";
import type { Job } from "@/data/mockData";
import { affinityScore } from "@/lib/ats";
import { useStore } from "@/lib/store";

export function JobCard({ job, compact = false }: { job: Job; compact?: boolean }) {
  const { profile, saveJob, setSelectedJobId } = useStore();
  const score = affinityScore(job, profile);
  return (
    <Card className="transition-shadow hover:shadow-soft">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
          <MatchBadge score={score} />
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
          <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" />{job.salary}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="sky">{job.seniority}</Badge>
          <Badge variant="sky">{job.mode}</Badge>
          <Badge variant="outline">{job.area}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!compact && (
          <Accordion type="single" collapsible>
            <AccordionItem value="req">
              <AccordionTrigger className="py-2 text-sm">Requisitos obrigatórios</AccordionTrigger>
              <AccordionContent><ul className="ml-4 list-disc text-sm">{job.required.map((r) => <li key={r}>{r}</li>)}</ul></AccordionContent>
            </AccordionItem>
            <AccordionItem value="nice">
              <AccordionTrigger className="py-2 text-sm">Diferenciais</AccordionTrigger>
              <AccordionContent><ul className="ml-4 list-disc text-sm">{job.niceToHave.map((r) => <li key={r}>{r}</li>)}</ul></AccordionContent>
            </AccordionItem>
            <AccordionItem value="ben" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm">Benefícios</AccordionTrigger>
              <AccordionContent><div className="flex flex-wrap gap-1.5">{job.benefits.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}</div></AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1" onClick={() => setSelectedJobId(job.id)}>
            <Link to="/estudio"><Sparkles className="h-4 w-4" />Otimizar CV</Link>
          </Button>
          <Button size="sm" variant="outline" onClick={() => { saveJob(job.id); toast.success("Vaga salva no rastreador"); }}>
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
