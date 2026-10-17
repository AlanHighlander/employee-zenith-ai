import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LOJAS_SEMENTE, type Loja } from "./lojas";
import { PERFIS_DEMO, type PerfilDemo } from "./perfis";

/** Valor especial do seletor: visão consolidada da empresa. */
export const TODAS_LOJAS = "todas";

const KEY_LOJA = "p360.lojaSelecionada";
const KEY_PERFIL = "p360.perfilDemo";
const KEY_LOJAS = "p360.lojasDemo";

type Scope = {
  perfil: PerfilDemo;
  setPerfilId: (id: string) => void;
  /** Todas as lojas cadastradas (inclui inativas) — usado na administração. */
  lojas: Loja[];
  /** Lojas ativas que o perfil pode consultar — usadas no seletor. */
  lojasPermitidas: Loja[];
  /** id da loja ou TODAS_LOJAS. */
  lojaId: string;
  setLojaId: (id: string) => void;
  lojaAtual: Loja | null;
  /** ids efetivamente no escopo (uma loja ou todas as permitidas). */
  lojasNoEscopo: string[];
  /** Proporção do quadro do escopo frente ao total — apenas para dados de demonstração. */
  fatorDemo: number;
  salvarLoja: (l: Loja) => void;
  removerLoja: (id: string) => void;
};

const Ctx = createContext<Scope | null>(null);

/**
 * Escopo global de loja + perfil. A seleção vive no sessionStorage: permanece
 * ao navegar e termina quando a sessão (aba) é encerrada.
 */
export function ScopeProvider({ children }: { children: ReactNode }) {
  const [perfilId, setPerfilIdState] = useState(PERFIS_DEMO[0]!.id);
  const [lojaId, setLojaIdState] = useState<string>(TODAS_LOJAS);
  const [lojas, setLojas] = useState<Loja[]>(LOJAS_SEMENTE);

  useEffect(() => {
    const p = sessionStorage.getItem(KEY_PERFIL);
    const l = sessionStorage.getItem(KEY_LOJA);
    const ls = sessionStorage.getItem(KEY_LOJAS);
    if (p) setPerfilIdState(p);
    if (l) setLojaIdState(l);
    if (ls) { try { setLojas(JSON.parse(ls)); } catch { /* ignora */ } }
  }, []);

  const perfil = PERFIS_DEMO.find((p) => p.id === perfilId) ?? PERFIS_DEMO[0]!;
  const lojasPermitidas = useMemo(
    () => lojas.filter((l) => l.ativa && (perfil.lojas === "*" || perfil.lojas.includes(l.id))),
    [lojas, perfil],
  );

  // Garante uma seleção válida para o perfil atual.
  const lojaIdValida =
    lojaId === TODAS_LOJAS
      ? perfil.podeVerTodas ? TODAS_LOJAS : lojasPermitidas[0]?.id ?? ""
      : lojasPermitidas.some((l) => l.id === lojaId) ? lojaId : perfil.podeVerTodas ? TODAS_LOJAS : lojasPermitidas[0]?.id ?? "";

  const setLojaId = useCallback((id: string) => { setLojaIdState(id); sessionStorage.setItem(KEY_LOJA, id); }, []);
  const setPerfilId = useCallback((id: string) => { setPerfilIdState(id); sessionStorage.setItem(KEY_PERFIL, id); }, []);
  const persistLojas = (next: Loja[]) => { setLojas(next); sessionStorage.setItem(KEY_LOJAS, JSON.stringify(next)); };

  const salvarLoja = (l: Loja) => persistLojas(lojas.some((x) => x.id === l.id) ? lojas.map((x) => (x.id === l.id ? l : x)) : [...lojas, l]);
  const removerLoja = (id: string) => persistLojas(lojas.filter((x) => x.id !== id || x.possuiHistorico));

  const lojaAtual = lojaIdValida === TODAS_LOJAS ? null : lojas.find((l) => l.id === lojaIdValida) ?? null;
  const lojasNoEscopo = lojaAtual ? [lojaAtual.id] : lojasPermitidas.map((l) => l.id);
  const total = lojas.filter((l) => l.ativa).reduce((a, l) => a + l.quadroDemo, 0) || 1;
  const fatorDemo = lojas.filter((l) => lojasNoEscopo.includes(l.id)).reduce((a, l) => a + l.quadroDemo, 0) / total;

  return (
    <Ctx.Provider value={{ perfil, setPerfilId, lojas, lojasPermitidas, lojaId: lojaIdValida, setLojaId, lojaAtual, lojasNoEscopo, fatorDemo, salvarLoja, removerLoja }}>
      {children}
    </Ctx.Provider>
  );
}

export function useScope() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useScope precisa estar dentro de ScopeProvider");
  return c;
}

/** Rótulo legível da unidade selecionada. */
export function useUnidadeLabel() {
  const { lojaAtual } = useScope();
  return lojaAtual ? lojaAtual.nome : "Todas as lojas";
}
