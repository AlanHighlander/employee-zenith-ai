import { createContext, useContext, useState, type ReactNode } from "react";

/** "todas" = modo administrativo (visão consolidada de todas as lojas). */
export const TODAS_LOJAS = "todas";

const LojaContext = createContext<{ loja: string; setLoja: (l: string) => void }>({
  loja: TODAS_LOJAS,
  setLoja: () => {},
});

export function LojaProvider({ children }: { children: ReactNode }) {
  const [loja, setLoja] = useState(TODAS_LOJAS);
  return <LojaContext.Provider value={{ loja, setLoja }}>{children}</LojaContext.Provider>;
}

export const useLoja = () => useContext(LojaContext);
