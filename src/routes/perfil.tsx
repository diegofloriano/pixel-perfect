import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/data/mockData";
import { profileCompleteness } from "@/lib/profile";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil & Currículo Base — MatchCV AI" },
      { name: "description", content: "Monte seu currículo mestre com experiências, formação e habilidades." },
      { property: "og:title", content: "Meu Perfil & Currículo Base — MatchCV AI" },
      { property: "og:description", content: "Monte seu currículo mestre com experiências, formação e habilidades." },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { profile, updateProfile } = useStore();
  const [draft, setDraft] = useState<Profile>(profile);
  const [raw, setRaw] = useState("");
  useEffect(() => setDraft(profile), [profile]);
  const set = (patch: Partial<Profile>) => setDraft((d) => ({ ...d, ...patch }));
  const pct = profileCompleteness(draft);

  const save = () => { updateProfile(draft); toast.success("Currículo base salvo!"); };
  const importRaw = () => {
    if (!raw.trim()) return toast.error("Cole o texto do seu currículo primeiro");
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    const bullets = lines.filter((l) => /^[-•*]/.test(l)).map((l) => l.replace(/^[-•*]\s*/, ""));
    const summary = lines.find((l) => l.length > 80) ?? draft.summary;
    set({ summary, experiences: bullets.length ? [{ role: draft.title, company: "Importado", period: "", bullets }, ...draft.experiences] : draft.experiences });
    toast.success("Texto importado — revise as abas");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Meu Perfil & Currículo Base</h1>
          <p className="text-sm text-muted-foreground">Seu Master Resume — a base de todas as versões ATS.</p>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={pct} className="h-2 w-32" />
          <Badge variant="highlight">{pct}% completo</Badge>
          <Button onClick={save}>Salvar</Button>
        </div>
      </div>
      <Tabs defaultValue="pessoal">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="pessoal">Dados pessoais</TabsTrigger>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="exp">Experiências</TabsTrigger>
          <TabsTrigger value="edu">Formação</TabsTrigger>
          <TabsTrigger value="skills">Habilidades</TabsTrigger>
          <TabsTrigger value="raw">Colar texto</TabsTrigger>
        </TabsList>

        <TabsContent value="pessoal">
          <Card><CardContent className="grid gap-4 p-6 md:grid-cols-2">
            {(["name", "title", "email", "phone", "location", "linkedin"] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label className="capitalize">{{ name: "Nome", title: "Cargo", email: "E-mail", phone: "Telefone", location: "Cidade", linkedin: "LinkedIn" }[k]}</Label>
                <Input value={draft[k]} onChange={(e) => set({ [k]: e.target.value })} />
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="resumo">
          <Card><CardContent className="p-6">
            <Textarea rows={6} value={draft.summary} onChange={(e) => set({ summary: e.target.value })} />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="exp" className="space-y-3">
          {draft.experiences.map((e, i) => (
            <Card key={i}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{e.role || "Nova experiência"}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => set({ experiences: draft.experiences.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {(["role", "company", "period"] as const).map((k) => (
                  <Input key={k} placeholder={{ role: "Cargo", company: "Empresa", period: "Período" }[k]} value={e[k]}
                    onChange={(ev) => set({ experiences: draft.experiences.map((x, j) => (j === i ? { ...x, [k]: ev.target.value } : x)) })} />
                ))}
                <Textarea className="md:col-span-3" rows={4} placeholder="Um bullet por linha" value={e.bullets.join("\n")}
                  onChange={(ev) => set({ experiences: draft.experiences.map((x, j) => (j === i ? { ...x, bullets: ev.target.value.split("\n") } : x)) })} />
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={() => set({ experiences: [...draft.experiences, { role: "", company: "", period: "", bullets: [] }] })}><Plus className="h-4 w-4" />Adicionar experiência</Button>
        </TabsContent>

        <TabsContent value="edu">
          <Card><CardContent className="space-y-3 p-6">
            {draft.education.map((e, i) => (
              <div key={i} className="grid gap-3 md:grid-cols-3">
                {(["degree", "school", "year"] as const).map((k) => (
                  <Input key={k} value={e[k]} placeholder={{ degree: "Curso", school: "Instituição", year: "Ano" }[k]}
                    onChange={(ev) => set({ education: draft.education.map((x, j) => (j === i ? { ...x, [k]: ev.target.value } : x)) })} />
                ))}
              </div>
            ))}
            <Button variant="outline" onClick={() => set({ education: [...draft.education, { degree: "", school: "", year: "" }] })}><Plus className="h-4 w-4" />Adicionar formação</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card><CardContent className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label>Habilidades técnicas (separe por vírgula)</Label>
              <Textarea rows={3} value={draft.skills.join(", ")} onChange={(e) => set({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <div className="flex flex-wrap gap-1.5 pt-1">{draft.skills.map((s) => <Badge key={s} variant="sky">{s}</Badge>)}</div>
            </div>
            <div className="space-y-1.5">
              <Label>Certificações (uma por linha)</Label>
              <Textarea rows={3} value={draft.certifications.join("\n")} onChange={(e) => set({ certifications: e.target.value.split("\n").filter(Boolean) })} />
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="raw">
          <Card><CardContent className="space-y-3 p-6">
            <Textarea rows={10} placeholder="Cole aqui o texto bruto do seu currículo..." value={raw} onChange={(e) => setRaw(e.target.value)} />
            <Button onClick={importRaw}>Importar texto</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
