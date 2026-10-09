import type { Job, Profile } from "@/data/mockData";
import { countTerm, extractKeywords, norm, type Keyword } from "@/lib/keywords";

export function profileText(p: Profile) {
  return [p.title, p.summary, ...p.skills, ...p.certifications, ...p.experiences.flatMap((e) => [e.role, ...e.bullets])].join(" ");
}

/** Weighted keyword set for a job: curated keywords + terms extracted from the description. */
export function jobKeywords(job: Job): Keyword[] {
  const map = new Map<string, Keyword>();
  for (const k of job.keywords) map.set(norm(k), { term: k, weight: 1 });
  for (const k of extractKeywords(job.description)) {
    const key = norm(k.term);
    const dup = [...map.keys()].some((m) => m === key || ` ${m} `.includes(` ${key} `) || ` ${key} `.includes(` ${m} `));
    if (!dup) map.set(key, { term: k.term, weight: Math.max(0.3, k.weight * 0.8) });
  }
  return [...map.values()].slice(0, 20);
}

export function keywordMatch(keywords: string[], text: string) {
  const found = keywords.filter((k) => countTerm(text, k) > 0);
  const missing = keywords.filter((k) => countTerm(text, k) === 0);
  return { found, missing };
}

/** Affinity: weighted % of job keywords present in the profile. */
export function affinityScore(job: Job, profile: Profile) {
  const kws = jobKeywords(job);
  const text = profileText(profile);
  const total = kws.reduce((s, k) => s + k.weight, 0) || 1;
  const hit = kws.filter((k) => countTerm(text, k.term) > 0).reduce((s, k) => s + k.weight, 0);
  return Math.round((hit / total) * 100);
}

/** First-person past-tense impact verbs (matches the résumé's voice). */
export const IMPACT_VERBS = [
  "desenvolvi", "liderei", "otimizei", "implementei", "automatizei", "coordenei", "criei", "construi", "aumentei",
  "reduzi", "defini", "melhorei", "conduzi", "entreguei", "elaborei", "estruturei", "integrei", "monitorei", "colaborei",
  "contribui", "projetei", "lancei", "gerenciei", "analisei", "executei", "mentorei", "escalei",
];

/** Weak openers → impact-verb rewrite, keeping the first-person agreement of the sentence. */
const REWRITES: [RegExp, string][] = [
  [/^participei (da|do|de|das|dos|na|no) /i, "Colaborei $1 "],
  [/^ajudei (a|na|no|com) /i, "Contribuí $1 "],
  [/^trabalhei (com|em|no|na) /i, "Atuei $1 "],
  [/^fui respons[aá]vel (por|pela|pelo) /i, "Coordenei "],
  [/^escrevi /i, "Elaborei "],
  [/^fiz /i, "Executei "],
  [/^acompanhei /i, "Monitorei "],
  [/^apoiei /i, "Contribuí com "],
  [/^cuidei (de|da|do) /i, "Gerenciei "],
  [/^montei /i, "Estruturei "],
];

const startsWithImpact = (b: string) => IMPACT_VERBS.some((v) => norm(b).startsWith(v));

/** Upgrade a bullet's opener if a known weak verb is found; otherwise return it untouched. */
export function polishBullet(b: string): string {
  if (startsWithImpact(b)) return b;
  for (const [re, rep] of REWRITES) if (re.test(b)) {
    const out = b.replace(re, rep);
    return out.charAt(0).toUpperCase() + out.slice(1);
  }
  return b;
}

const joinPt = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`);

export function atsChecklist(profile: Profile, job: Job) {
  const text = profileText(profile);
  const kws = jobKeywords(job);
  const found = kws.filter((k) => countTerm(text, k.term) > 0).map((k) => k.term);
  const missing = kws.filter((k) => countTerm(text, k.term) === 0).map((k) => k.term);
  const total = kws.reduce((s, k) => s + k.weight, 0) || 1;
  const coverage = kws.filter((k) => found.includes(k.term)).reduce((s, k) => s + k.weight, 0) / total;
  // Density: matched terms appearing 2+ times (summary + experience/skills) score higher
  const density = found.length ? found.filter((t) => countTerm(text, t) >= 2).length / found.length : 0;
  const bullets = profile.experiences.flatMap((e) => e.bullets).filter(Boolean);
  const verbs = bullets.filter(startsWithImpact).length;
  const metrics = bullets.filter((b) => /\d/.test(b)).length;
  const verbRatio = verbs / Math.max(bullets.length, 1);
  const metricRatio = metrics / Math.max(bullets.length, 1);
  const score = Math.min(100, Math.round(coverage * 50 + density * 12 + 10 + verbRatio * 14 + Math.min(metricRatio * 2, 1) * 14));
  return {
    score,
    found,
    missing,
    checks: [
      { label: "Formato de 1 coluna, sem tabelas ou gráficos", ok: true },
      { label: `Palavras-chave da vaga (${found.length}/${kws.length})`, ok: coverage >= 0.7 },
      { label: `Densidade: termos repetidos em mais de uma seção (${Math.round(density * 100)}%)`, ok: density >= 0.4 },
      { label: `Verbos de impacto no início dos bullets (${verbs}/${bullets.length})`, ok: verbRatio >= 0.6 },
      { label: `Métricas quantificáveis (${metrics} bullets com números)`, ok: metricRatio >= 0.4 },
    ],
  };
}

/** Simulated AI rewrite: integrates job keywords and reorders content by relevance. */
export function optimizeResume(profile: Profile, job: Job): Profile {
  const kws = jobKeywords(job);
  const text = profileText(profile);
  const owned = kws.filter((k) => countTerm(text, k.term) > 0).sort((a, b) => b.weight - a.weight);
  const top3 = (owned.length >= 3 ? owned : [...owned, ...kws.filter((k) => !owned.includes(k))]).slice(0, 3).map((k) => k.term);
  const rest = profile.summary.split(/(?<=\.)\s+/).slice(1).join(" ").trim();
  const extra = owned.slice(3, 5).map((k) => k.term);
  const summary = [
    `${profile.title} com experiência em ${joinPt(top3)}.`,
    rest,
    extra.length ? `Também atua com ${joinPt(extra)}.` : "",
  ].filter(Boolean).join(" ");

  const relevance = (b: string) => kws.reduce((s, k) => s + (countTerm(b, k.term) > 0 ? k.weight : 0), 0);
  const experiences = profile.experiences.map((e) => ({
    ...e,
    bullets: [...e.bullets].sort((a, b) => relevance(b) - relevance(a)).map(polishBullet),
  }));

  const skillSet = new Map<string, string>();
  for (const k of kws) {
    const own = profile.skills.find((s) => norm(s) === norm(k.term));
    if (own || countTerm(text, k.term) > 0) skillSet.set(norm(k.term), own ?? k.term);
  }
  for (const s of profile.skills) if (!skillSet.has(norm(s))) skillSet.set(norm(s), s);
  return { ...profile, summary, experiences, skills: [...skillSet.values()] };
}

export function suggestionFor(term: string) {
  return `Aplicação prática de ${term} em projetos recentes, com foco em qualidade e resultados mensuráveis.`;
}

export function resumeToText(p: Profile) {
  return [
    p.name.toUpperCase(),
    `${p.title} | ${p.location} | ${p.email} | ${p.phone} | ${p.linkedin}`,
    "",
    "RESUMO PROFISSIONAL",
    p.summary,
    "",
    "EXPERIÊNCIA",
    ...p.experiences.flatMap((e) => [`${e.role} – ${e.company} (${e.period})`, ...e.bullets.map((b) => `- ${b}`), ""]),
    "FORMAÇÃO",
    ...p.education.map((e) => `${e.degree} – ${e.school} (${e.year})`),
    "",
    "HABILIDADES",
    p.skills.join(", "),
    "",
    "CERTIFICAÇÕES",
    ...p.certifications,
  ].join("\n");
}
