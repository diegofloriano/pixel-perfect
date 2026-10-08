import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/lib/store";
import { profileCompleteness } from "@/lib/profile";

export function AppHeader() {
  const { profile, profiles, setProfileId } = useStore();
  const pct = profileCompleteness(profile);
  return (
    <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/90 px-3 backdrop-blur">
      <SidebarTrigger />
      <div className="hidden items-center gap-2 md:flex">
        <span className="text-xs text-muted-foreground">Perfil</span>
        <Progress value={pct} className="h-2 w-28" />
        <span className="rounded-full bg-highlight px-2 py-0.5 text-xs font-semibold text-highlight-foreground">{pct}%</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Select value={profile.id} onValueChange={setProfileId}>
          <SelectTrigger className="h-9 w-[190px]"><SelectValue /></SelectTrigger>
          <SelectContent>{profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
        </Select>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-highlight-strong" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>2 novas vagas com match alto</TooltipContent>
        </Tooltip>
        <Avatar className="h-8 w-8"><AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{profile.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
      </div>
    </header>
  );
}
