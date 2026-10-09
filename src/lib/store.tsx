import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { initialApplications, jobs as seedJobs, profiles as seedProfiles, type Application, type Job, type Profile, type Stage } from "@/data/mockData";

const STORAGE_KEY = "matchcv:v2";

type Persisted = {
  profiles: Profile[];
  profileId: string;
  jobs: Job[];
  selectedJobId: string;
  applications: Application[];
  resumesGenerated: number;
};

const demo = (): Persisted => ({
  profiles: seedProfiles,
  profileId: seedProfiles[0]!.id,
  jobs: seedJobs,
  selectedJobId: seedJobs[0]!.id,
  applications: initialApplications,
  resumesGenerated: 2,
});

/** localStorage-backed state. Loads after mount to avoid SSR hydration mismatch. */
function usePersistentState() {
  const [state, setState] = useState<Persisted>(demo);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...demo(), ...(JSON.parse(raw) as Partial<Persisted>) });
    } catch { /* corrupted storage → keep demo */ }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);
  return { state, setState, hydrated };
}

type Store = {
  hydrated: boolean;
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
  resetDemo: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { state, setState, hydrated } = usePersistentState();
  const patch = (fn: (s: Persisted) => Partial<Persisted>) => setState((s) => ({ ...s, ...fn(s) }));
  const today = () => new Date().toISOString().slice(0, 10);
  const profile = state.profiles.find((p) => p.id === state.profileId) ?? state.profiles[0]!;

  const upsertApplication = (jobId: string, p: Partial<Application>) =>
    patch((s) => {
      const ex = s.applications.find((a) => a.jobId === jobId);
      return {
        applications: ex
          ? s.applications.map((a) => (a.jobId === jobId ? { ...a, ...p, updatedAt: today() } : a))
          : [...s.applications, { id: crypto.randomUUID(), jobId, stage: "Salva", updatedAt: today(), ...p }],
      };
    });

  return (
    <Ctx.Provider
      value={{
        hydrated,
        profiles: state.profiles,
        profile,
        setProfileId: (id) => patch(() => ({ profileId: id })),
        updateProfile: (p) => patch((s) => ({ profiles: s.profiles.map((x) => (x.id === p.id ? p : x)) })),
        jobs: state.jobs,
        addJob: (j) => patch((s) => ({ jobs: [j, ...s.jobs] })),
        selectedJobId: state.selectedJobId,
        setSelectedJobId: (id) => patch(() => ({ selectedJobId: id })),
        applications: state.applications,
        saveJob: (jobId) => { if (!state.applications.some((a) => a.jobId === jobId)) upsertApplication(jobId, { stage: "Salva" }); },
        upsertApplication,
        moveApplication: (id, stage) => patch((s) => ({ applications: s.applications.map((a) => (a.id === id ? { ...a, stage, updatedAt: today() } : a)) })),
        resumesGenerated: state.resumesGenerated,
        incResumes: () => patch((s) => ({ resumesGenerated: s.resumesGenerated + 1 })),
        resetDemo: () => setState(demo()),
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
