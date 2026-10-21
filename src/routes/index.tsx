import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useScrum } from "@/context/ScrumContext";
import { WorkspaceShell } from '@/components/scrum/WorkspaceShell';
import { Button } from '@/components/ui/button';
import { Guia } from "@/components/scrum/Guia";
import { Backlog } from "@/components/scrum/Backlog";
import { SprintBoard } from "@/components/scrum/SprintBoard";
import { Historico } from "@/components/scrum/Historico";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scrumbão — aprenda Scrum na prática" },
      { name: "description", content: "Quadro Scrum público e didático: backlog, sprint planning, daily, review e retrospectiva, sem login." },
      { property: "og:title", content: "Scrumbão — aprenda Scrum na prática" },
      { property: "og:description", content: "Quadro Scrum público e didático, sem login." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
   component: () => <WorkspaceShell><App /></WorkspaceShell>,
});

type Aba = "guia" | "backlog" | "sprint" | "historico";

function App() {
  const { s, pronto } = useScrum();
  const [aba, setAba] = useState<Aba>("guia");
  const abas: { id: Aba; nome: string }[] = [
    { id: "guia", nome: "Como funciona" },
    { id: "backlog", nome: "Backlog" },
    { id: "sprint", nome: s.sprint ? `Sprint ${s.sprint.numero}` : "Sprint" },
    { id: "historico", nome: "Histórico" },
  ];

  return (
    <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <nav aria-label="Etapas do Scrum" className="flex flex-wrap gap-1 border-b border-border pb-3">
            {abas.map((a) => (
              <Button key={a.id} onClick={() => setAba(a.id)} aria-pressed={aba===a.id} variant={aba===a.id?'default':'ghost'}>
                {a.nome}
              </Button>
            ))}
          </nav>
        </div>
      <main className={cn("mx-auto max-w-7xl px-4 py-8 transition-opacity", !pronto && "opacity-0")}>
        {aba === "guia" && <Guia comecar={() => setAba("backlog")} />}
        {aba === "backlog" && <Backlog irParaSprint={() => setAba("sprint")} />}
        {aba === "sprint" && <SprintBoard irParaBacklog={() => setAba("backlog")} />}
        {aba === "historico" && <Historico />}
      </main>
    </div>
  );
}
