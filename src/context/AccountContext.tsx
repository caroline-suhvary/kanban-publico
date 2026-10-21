import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
const Context = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
export function AccountProvider({ children }: { children: ReactNode }) {
  const [user,setUser] = useState<User | null>(null);
  const [loading,setLoading] = useState(true);
  const cache=useQueryClient(); const router=useRouter();
  useEffect(() => {
    let active=true;
    const sync=async () => {
      const {data}=await supabase.auth.getUser();
      if(!active) return;
      setUser(data.user); setLoading(false);
      if(data.user) await supabase.rpc('scrumbao_conta',{});
    };
    const {data:{subscription}}=supabase.auth.onAuthStateChange(event => {
      if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event)) return;
      if(event==='SIGNED_OUT') { setUser(null); cache.clear(); }
      else { void sync(); void cache.invalidateQueries(); }
      void router.invalidate();
    });
    void sync();
    return () => { active=false; subscription.unsubscribe(); };
  },[cache,router]);
  return <Context.Provider value={{user,loading}}>{children}</Context.Provider>;
}
export const useAccount=()=>useContext(Context);