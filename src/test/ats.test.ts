import { describe, expect, it } from "vitest";
import { jobs, profiles } from "@/data/mockData";
import { extractKeywords } from "@/lib/keywords";
import { atsChecklist, optimizeResume, polishBullet } from "@/lib/ats";

const JD = `Desenvolvedor Front-end
Requisitos:
- Experiência com React e TypeScript
- Pipelines de CI/CD
- Design System e REST API
Diferenciais:
- Scrum Master
Benefícios:
- Vale refeição`;

describe("extractKeywords", () => {
  const terms = extractKeywords(JD).map((k) => k.term);
  it("keeps compound terms", () => {
    expect(terms).toEqual(expect.arrayContaining(["CI/CD", "Design System", "REST API", "Scrum Master", "React", "TypeScript"]));
  });
  it("drops stopwords and filler", () => {
    expect(terms.map((t) => t.toLowerCase())).not.toContain("experiência");
    expect(terms.map((t) => t.toLowerCase())).not.toContain("com");
  });
  it("weights the Requisitos section above Benefícios", () => {
    const kw = extractKeywords(JD);
    const react = kw.find((k) => k.term === "React")!.weight;
    const vr = kw.find((k) => /vale/i.test(k.term))?.weight ?? 0;
    expect(react).toBeGreaterThan(vr);
  });
});

describe("ATS rewrite", () => {
  it("never adds the 'Atuei:' prefix", () => {
    const o = optimizeResume(profiles[0]!, jobs[0]!);
    expect(o.experiences.flatMap((e) => e.bullets).some((b) => b.startsWith("Atuei:"))).toBe(false);
  });
  it("rewrites weak openers with an impact verb", () => {
    expect(polishBullet("Participei da criação do design system")).toBe("Colaborei da criação do design system".replace("Colaborei da", "Colaborei da"));
    expect(polishBullet("Escrevi testes unitários")).toBe("Elaborei testes unitários");
  });
  it("leaves bullets without a known weak verb untouched", () => {
    expect(polishBullet("Integração de APIs REST")).toBe("Integração de APIs REST");
  });
  it("summary starts with '[Cargo] com experiência em'", () => {
    const o = optimizeResume(profiles[0]!, jobs[0]!);
    expect(o.summary.startsWith("Desenvolvedora Front-end com experiência em ")).toBe(true);
  });
  it("score stays within 0-100 and improves after optimization", () => {
    const before = atsChecklist(profiles[0]!, jobs[0]!).score;
    const after = atsChecklist(optimizeResume(profiles[0]!, jobs[0]!), jobs[0]!).score;
    expect(after).toBeGreaterThanOrEqual(before);
    expect(after).toBeLessThanOrEqual(100);
  });
});
