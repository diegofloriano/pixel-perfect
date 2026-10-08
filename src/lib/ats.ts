import type { Job, Profile } from "@/data/mockData";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function profileText(p: Profile) {
  return [p.title, p.summary, ...p.skills, ...p.certifications, ...p.experiences.flatMap((e) => [e.role, ...e.bullets])].join(" ");
}

export function keywordMatch(keywords: string[], text: string) {
  const t = norm(text);
  const found = keywords.filter((k) => t.includes(norm(k)));
  const missing = keywords.filter((k) => !t.includes(norm(k)));
  return { found, missing };
}

/** Affinity: % of job keywords present in the profile. */
export function affinityScore(job: Job, profile: Profile) {
  const { found } = keywordMatch(job.keywords, profileText(profile));
  return Math.round((found.length / Math.max(job.keywords.length, 1)) * 100);
}

const ACTION_VERBS = ["desenvolvi", "liderei", "criei", "aumentei", "construi", "automatizei", "defini", "melhorei", "reduzi", "implementei", "conduzi", "otimizei", "entreguei"];

export function atsChecklist(profile: Profile, job: Job) {
  const text = profileText(profile);
  const { found, missing } = keywordMatch(job.keywords, text);
  const bullets = profile.experiences.flatMap((e) => e.bullets);
  const verbs = bullets.filter((b) => ACTION_VERBS.some((v) => norm(b).startsWith(v))).length;
  const metrics = bullets.filter((b) => /\d/.test(b)).length;
  const kwRatio = found.length / Math.max(job.keywords.length, 1);
  const verbRatio = verbs / Math.max(bullets.length, 1);
  const metricRatio = metrics / Math.max(bullets.length, 1);
  const score = Math.min(100, Math.round(kwRatio * 60 + 15 /* single-column format */ + verbRatio * 12 + Math.min(metricRatio * 2, 1) * 13));
  return {
    score,
    found,
    missing,
    checks: [
      { label: "Formato de 1 coluna, sem tabelas ou gráficos", ok: true },
      { label: `Palavras-chave da vaga (${found.length}/${job.keywords.length})`, ok: kwRatio >= 0.7 },
      { label: `Verbos de ação no início dos bullets (${verbs}/${bullets.length})`, ok: verbRatio >= 0.6 },
      { label: `Métricas quantificáveis (${metrics} bullets com números)`, ok: metricRatio >= 0.4 },
    ],
  };
}

/** Simulated AI rewrite: injects job keywords and reorders content. */
export function optimizeResume(profile: Profile, job: Job): Profile {
  const { found, missing } = keywordMatch(job.keywords, profileText(profile));
  const top = [...found, ...missing].slice(0, 5);
  const summary = `${profile.title} com experiência comprovada em ${top.slice(0, 3).join(", ")}. ${profile.summary.split(". ").slice(1).join(". ")} Foco em ${top.slice(3).join(" e ") || "resultados mensuráveis"}, alinhado(a) aos desafios de ${job.company}.`.replace(/\s+/g, " ");
  const kw = job.keywords.map(norm);
  const relevance = (b: string) => kw.filter((k) => norm(b).includes(k)).length;
  const experiences = profile.experiences.map((e) => ({
    ...e,
    bullets: [...e.bullets]
      .sort((a, b) => relevance(b) - relevance(a))
      .map((b) => (ACTION_VERBS.some((v) => norm(b).startsWith(v)) ? b : `Atuei: ${b.charAt(0).toLowerCase()}${b.slice(1)}`)),
  }));
  const skillSet = new Map<string, string>();
  for (const k of job.keywords) {
    const own = profile.skills.find((s) => norm(s) === norm(k));
    if (own || found.includes(k)) skillSet.set(norm(k), own ?? k);
  }
  for (const s of profile.skills) if (!skillSet.has(norm(s))) skillSet.set(norm(s), s);
  return { ...profile, summary, experiences, skills: [...skillSet.values()] };
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
