import type { Profile } from "@/data/mockData";

/** Classic ATS-friendly template: one column, standard font, uniform margins. */
export function ResumePreview({ profile, highlight = [] }: { profile: Profile; highlight?: string[] }) {
  const hl = (text: string) => {
    if (!highlight.length) return text;
    const re = new RegExp(`(${highlight.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    return text.split(re).map((part, i) =>
      highlight.some((h) => h.toLowerCase() === part.toLowerCase()) ? (
        <mark key={i} className="rounded bg-highlight px-0.5 text-foreground print:bg-transparent">{part}</mark>
      ) : (
        part
      ),
    );
  };
  return (
    <article className="print-area font-resume bg-card p-8 text-[13px] leading-relaxed text-foreground">
      <header className="text-center">
        <h1 className="font-resume text-2xl font-bold tracking-normal">{profile.name}</h1>
        <p className="text-sm">{profile.title}</p>
        <p className="mt-1 text-xs text-secondary-foreground">
          {profile.location} · {profile.email} · {profile.phone} · {profile.linkedin}
        </p>
      </header>
      <Section title="Resumo Profissional"><p>{hl(profile.summary)}</p></Section>
      <Section title="Experiência">
        {profile.experiences.map((e) => (
          <div key={e.role + e.company} className="mb-3">
            <div className="flex justify-between font-bold"><span>{e.role} – {e.company}</span><span className="font-normal">{e.period}</span></div>
            <ul className="ml-5 list-disc">{e.bullets.map((b) => <li key={b}>{hl(b)}</li>)}</ul>
          </div>
        ))}
      </Section>
      <Section title="Formação">
        {profile.education.map((e) => <p key={e.degree}>{e.degree} – {e.school} ({e.year})</p>)}
      </Section>
      <Section title="Habilidades"><p>{hl(profile.skills.join(", "))}</p></Section>
      {profile.certifications.length > 0 && (
        <Section title="Certificações">{profile.certifications.map((c) => <p key={c}>{c}</p>)}</Section>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="font-resume mb-1 border-b border-foreground pb-0.5 text-sm font-bold uppercase tracking-normal">{title}</h2>
      {children}
    </section>
  );
}
