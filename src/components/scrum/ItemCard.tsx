import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Link2,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { COLUNAS, ETIQUETAS, type Item } from "@/lib/scrum";
import { useScrum } from "@/context/ScrumContext";
import { ItemDialog } from "./ItemDialog";
import { cn } from "@/lib/utils";

export function ItemCard({
  item,
  prioridade,
  modo,
}: {
  item: Item;
  prioridade?: number;
  modo: "backlog" | "sprint";
}) {
  const { dispatch } = useScrum();
  const [editando, setEditando] = useState(false);
  const idx = COLUNAS.findIndex((c) => c.id === item.coluna);

  return (
    <article
      draggable={modo === "sprint"}
      onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
      className={cn(
        "group rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        modo === "sprint" && "cursor-grab active:cursor-grabbing",
        item.coluna === "feito" && "opacity-60",
      )}
    >
      <div className="flex items-start gap-2">
        {prioridade !== undefined && (
          <span className="font-display text-xs font-bold text-muted-foreground">
            #{prioridade}
          </span>
        )}
        <h3
          className={cn(
            "flex-1 text-sm font-medium leading-snug",
            item.coluna === "feito" && "line-through",
          )}
        >
          {item.titulo}
        </h3>
        <span
          title="Story points: esforço estimado"
          className="rounded-full bg-primary px-2 py-0.5 font-display text-xs font-bold text-primary-foreground"
        >
          {item.pontos}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        {item.etiquetas.map((e) => {
          const et = ETIQUETAS.find((x) => x.id === e);
          if (!et) return null;
          return (
            <span
              key={e}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                et.classe,
              )}
            >
              {et.nome}
            </span>
          );
        })}
        {item.responsavel && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            {item.responsavel}
          </span>
        )}
        {item.links.map((l, i) => (
          <a
            key={i}
            href={l}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary underline"
            title={l}
          >
            <Link2 className="h-3 w-3" />
            link
          </a>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1 opacity-70 group-hover:opacity-100">
        {modo === "backlog" ? (
          <>
            <Btn
              label="Subir prioridade"
              onClick={() => dispatch({ type: "PRIORIZAR", id: item.id, direcao: "cima" })}
            >
              <ArrowUp />
            </Btn>
            <Btn
              label="Descer prioridade"
              onClick={() => dispatch({ type: "PRIORIZAR", id: item.id, direcao: "baixo" })}
            >
              <ArrowDown />
            </Btn>
          </>
        ) : (
          <>
            <Btn
              label="Voltar coluna"
              disabled={idx <= 0}
              onClick={() => {
                const c = COLUNAS[idx - 1];
                if (c) dispatch({ type: "MOVER", id: item.id, coluna: c.id });
              }}
            >
              <ChevronLeft />
            </Btn>
            <Btn
              label="Avançar coluna"
              disabled={idx >= COLUNAS.length - 1}
              onClick={() => {
                const c = COLUNAS[idx + 1];
                if (c) dispatch({ type: "MOVER", id: item.id, coluna: c.id });
              }}
            >
              <ChevronRight />
            </Btn>
          </>
        )}
        <span className="flex-1" />
        <Btn label="Editar" onClick={() => setEditando(true)}>
          <Pencil />
        </Btn>
        {modo === "backlog" && (
          <Btn label="Excluir" onClick={() => dispatch({ type: "EXCLUIR_ITEM", id: item.id })}>
            <Trash2 />
          </Btn>
        )}
      </div>
      <ItemDialog aberto={editando} onFechar={() => setEditando(false)} item={item} />
    </article>
  );
}

function Btn({
  label,
  children,
  ...p
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      {...p}
      aria-label={label}
      title={label}
      className="h-7 w-7 [&_svg]:h-3.5 [&_svg]:w-3.5"
    >
      {children}
    </Button>
  );
}
