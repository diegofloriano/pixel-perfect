import type { Profile } from "@/data/mockData";

export function profileCompleteness(p: Profile) {
  const checks = [
    !!p.name, !!p.email, !!p.phone, !!p.location, !!p.linkedin,
    p.summary.length > 60, p.experiences.length > 0, p.education.length > 0,
    p.skills.length >= 5, p.certifications.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
