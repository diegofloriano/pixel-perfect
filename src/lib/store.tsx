import { createContext, useContext, useState, type ReactNode } from "react";
import { initialApplications, jobs as seedJobs, profiles as seedProfiles, type Application, type Job, type Profile, type Stage } from "@/data/mockData";

type Store = {
  profiles: Profile[];
  profile: Profile;
  setProfileId: (id: string) => void;
  updateProfile: (p: Profile) => void;
  jobs: Job[];
  addJob: (j: Job) => void;
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  applications: Application[];
  saveJob: (jobId: string) => void;
  upsertApplication: (jobId: string, patch: Partial<Application>) => void;
  moveApplication: (id: string, stage: Stage) => void;
  resumesGenerated: number;
  incResumes: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState(seedProfiles);
  const [profileId, setProfileId] = useState(seedProfiles[0]!.id);
  const [jobs, setJobs] = useState(seedJobs);
  const [selectedJobId, setSelectedJobId] = useState(seedJobs[0]!.id);
  const [applications, setApps] = useState(initialApplications);
  const [resumesGenerated, setRes] = useState(2);

  const profile = profiles.find((p) => p.id === profileId) ?? profiles[0]!;
  const today = () => new Date().toISOString().slice(0, 10);

  const upsertApplication = (jobId: string, patch: Partial<Application>) =>
    setApps((prev) => {
      const ex = prev.find((a) => a.jobId === jobId);
      if (ex) return prev.map((a) => (a.jobId === jobId ? { ...a, ...patch, updatedAt: today() } : a));
      return [...prev, { id: crypto.randomUUID(), jobId, stage: "Salva", updatedAt: today(), ...patch }];
    });

  return (
    <Ctx.Provider
      value={{
        profiles,
        profile,
        setProfileId,
        updateProfile: (p) => setProfiles((prev) => prev.map((x) => (x.id === p.id ? p : x))),
        jobs,
        addJob: (j) => setJobs((prev) => [j, ...prev]),
        selectedJobId,
        setSelectedJobId,
        applications,
        saveJob: (jobId) => {
          if (!applications.some((a) => a.jobId === jobId)) upsertApplication(jobId, { stage: "Salva" });
        },
        upsertApplication,
        moveApplication: (id, stage) => setApps((prev) => prev.map((a) => (a.id === id ? { ...a, stage, updatedAt: today() } : a))),
        resumesGenerated,
        incResumes: () => setRes((n) => n + 1),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
