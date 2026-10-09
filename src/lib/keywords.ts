/** Heuristic client-side keyword extractor for job descriptions (PT + EN). */

export type Keyword = { term: string; weight: number };

export const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const STOP = new Set(
  (
    // Portuguese
    "a o as os um uma uns umas de da do das dos em na no nas nos por pela pelo pelas pelos para pra com sem sob sobre entre ate e ou mas que se como mais menos muito muita muitos muitas ja nao sim seu sua seus suas nosso nossa nossos nossas voce voces ele ela eles elas isso isto esse essa esses essas este esta estes estas aquele aquela ao aos à às " +
    "ser estar ter haver sera sao e foi era tem temos possui possuir sendo bem tambem onde quando qual quais quem cada todo toda todos todas outro outra outros outras alem desde " +
    // Job-ad filler
    "vaga vagas buscamos procuramos procura busca pessoa pessoas profissional profissionais candidato candidata time equipe empresa nosso area areas atuacao atuar trabalhar trabalho experiencia experiencias conhecimento conhecimentos " +
    "requisitos requisito diferenciais diferencial desejavel desejaveis obrigatorio obrigatorios responsabilidades atividades beneficios tecnologias stack habilidades competencias anos ano nivel essencial importante esperamos espera " +
    "garantindo garantir sera vai voce ajudar apoiar liderar criar construir desenvolver responsavel solida forte boa bom avancado avancada basico basica completo completa etc " +
    // English
    "the and or of to in on for with a an is are be as at by from this that you your we our will have has years year experience knowledge strong plus nice must required requirements skills role team work working ability"
  ).split(/\s+/),
);

const SECTION_WEIGHTS: [RegExp, number][] = [
  [/^(requisitos|requirements|qualifica|o que (voce precisa|esperamos)|must have|obrigat)/, 3],
  [/^(tecnologias|stack|ferramentas|tech|tools)/, 2.5],
  [/^(diferenciais|desejavel|nice to have|plus|bonus)/, 2],
  [/^(responsabilidades|atividades|o que voce vai fazer|responsibilities)/, 1.5],
  [/^(beneficios|benefits|oferecemos|sobre (nos|a empresa)|about)/, 0.3],
];

/** Split a JD into weighted chunks by detecting standard section headings. */
function sections(text: string) {
  const out: { text: string; weight: number }[] = [];
  let weight = 1;
  for (const line of text.split(/\n+/)) {
    const n = norm(line.trim().replace(/^[#*\-•\s]+/, ""));
    const head = SECTION_WEIGHTS.find(([re]) => re.test(n));
    if (head && n.length < 60) {
      weight = head[1];
      const rest = line.split(/[:：]/).slice(1).join(":");
      if (rest.trim()) out.push({ text: rest, weight });
      continue;
    }
    out.push({ text: line, weight });
  }
  return out;
}

const TOKEN_RE = /[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9+#./-]*[A-Za-zÀ-ÿ0-9+#]|[A-Za-zÀ-ÿ0-9]/g;

function tokenize(chunk: string) {
  // Sentence/phrase boundaries break n-grams
  return chunk.split(/[,;:()!?\n]|\. |\s[-–]\s| e | and | ou | or /i).map((p) => (p.match(TOKEN_RE) ?? []).map((t) => t.replace(/[./-]+$/, "")));
}

const isTech = (t: string) => /[A-Z].*[A-Z]|[+#/.]|\d/.test(t) || /^[A-Z][a-z]+[A-Z]/.test(t);
const isProper = (t: string) => /^[A-ZÀ-Ý]/.test(t);

export function extractKeywords(text: string, limit = 18): Keyword[] {
  const scores = new Map<string, { term: string; score: number; count: number }>();
  const add = (term: string, w: number) => {
    const k = norm(term);
    const cur = scores.get(k);
    if (cur) { cur.score += w; cur.count++; } else scores.set(k, { term, score: w, count: 1 });
  };

  for (const { text: chunk, weight } of sections(text)) {
    for (const phrase of tokenize(chunk)) {
      const toks = phrase.filter(Boolean);
      for (let i = 0; i < toks.length; i++) {
        for (let n = 1; n <= 3 && i + n <= toks.length; n++) {
          const gram = toks.slice(i, i + n);
          const first = norm(gram[0]!), last = norm(gram[gram.length - 1]!);
          if (STOP.has(first) || STOP.has(last)) continue;
          if (n === 1 && first.length < 2) continue;
          if (gram.some((g) => /^\d+$/.test(g))) continue;
          const signal = gram.filter((g) => isTech(g) || isProper(g)).length;
          // Lowercase multi-word phrases only count if repeated or in high-weight sections
          if (n > 1 && signal === 0 && weight < 2) continue;
          if (n === 1 && signal === 0 && first.length < 4) continue;
          const bonus = 1 + signal * 0.8 + (n > 1 ? 0.6 : 0);
          add(gram.join(" "), weight * bonus);
        }
      }
    }
  }

  // Ignore capitalised sentence starters that occur once with low weight
  let list = [...scores.values()].filter((s) => s.score >= 1.5 || s.count > 1);
  list.sort((a, b) => b.score - a.score);

  // Drop unigrams subsumed by a stronger n-gram ("Design" inside "Design System")
  const kept: typeof list = [];
  for (const s of list) {
    const k = norm(s.term);
    const dominated = kept.some((o) => {
      const ok = norm(o.term);
      return ok !== k && (` ${ok} `.includes(` ${k} `) || ` ${k} `.includes(` ${ok} `)) && o.score >= s.score * 0.6;
    });
    if (!dominated) kept.push(s);
    if (kept.length >= limit) break;
  }
  const max = kept[0]?.score ?? 1;
  return kept.map((s) => ({ term: s.term, weight: Math.round((s.score / max) * 100) / 100 }));
}

/** Count occurrences of a term in text using word boundaries (accent-insensitive). */
export function countTerm(text: string, term: string) {
  const t = norm(text);
  const k = norm(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^a-z0-9])${k}(?=$|[^a-z0-9])`, "g");
  return (t.match(re) ?? []).length;
}
