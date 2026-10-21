/**
 * ScrumContext — guarda o estado do Scrumbão (Context + useReducer).
 * Nesta edição pública os dados ficam no navegador (localStorage):
 * cada visitante tem seu próprio quadro de estudo, sem login.
 * Na versão com Supabase, troque o "salvar/carregar" por chamadas ao banco.
 */
import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { estadoDemo, scrumReducer, type ScrumAction, type ScrumState } from "@/lib/scrum";
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

const CHAVE = "scrumbao:v1";
type Valor = { s: ScrumState; dispatch: (a: ScrumAction) => void; pronto: boolean; reiniciar: () => void; privado: boolean; salvando: boolean; erro: string; recarregar: () => void };
const Ctx = createContext<Valor | null>(null);

export function ScrumProvider({ children, workspace }: { children: ReactNode; workspace?: { id:string; estado:ScrumState; revisao:number } | undefined }) {
  const [s, rawDispatch] = useReducer(scrumReducer, workspace?.estado, estado => estado ?? estadoDemo());
  const [pronto, setPronto] = useState(false);
  const [salvando,setSalvando]=useState(false); const [erro,setErro]=useState('');
  const atual=useRef(s); const revisao=useRef(workspace?.revisao??0); const ocupado=useRef(false);
  const recarregar=async()=>{if(!workspace) return;const {data,error}=await supabase.from('scrums').select('estado,revisao').eq('id',workspace.id).single();if(error){setErro(error.message);return;}const estado={...(data.estado as unknown as ScrumState),time:workspace.estado.time};atual.current=estado;revisao.current=data.revisao;rawDispatch({type:'RESTAURAR',estado});setErro('');};
  const dispatch=async(a:ScrumAction)=>{
    if(!workspace){rawDispatch(a);return;}
    if(ocupado.current||erro||a.type==='DEFINIR_TIME'||a.type==='RESTAURAR') return;
    ocupado.current=true;setSalvando(true);
    const next=scrumReducer(atual.current,a);
    const {data,error}=await supabase.rpc('scrumbao_salvar',{p_id:workspace.id,p_estado:next as unknown as Json,p_revisao:revisao.current});
    if(error) setErro(error.message); else {revisao.current=data;atual.current=next;rawDispatch({type:'RESTAURAR',estado:next});}
    ocupado.current=false;setSalvando(false);
  };

  useEffect(() => {
    if(workspace){setPronto(true);return;}
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo) rawDispatch({ type: "RESTAURAR", estado: JSON.parse(salvo) });
    } catch { /* ignora dados corrompidos */ }
    setPronto(true);
  }, []);

  useEffect(() => {
    if (pronto && !workspace) localStorage.setItem(CHAVE, JSON.stringify(s));
  }, [s, pronto]);

  const reiniciar = () => dispatch({ type: "RESTAURAR", estado: estadoDemo() });
  return <Ctx.Provider value={{ s, dispatch, pronto, reiniciar, privado:!!workspace, salvando, erro, recarregar }}>{children}</Ctx.Provider>;
}

export function useScrum() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useScrum precisa do ScrumProvider");
  return v;
}
