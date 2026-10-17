import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, SendHorizontal, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/PageParts";
import { FutureNotice } from "@/components/app/DemoBadge";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente de IA · Pessoas360" },
      { name: "description", content: "Assistente de IA para consultas de RH, respeitando as permissões de cada usuário." },
      { property: "og:title", content: "Assistente de IA · Pessoas360" },
      { property: "og:description", content: "Consultas de RH em linguagem natural com controle de permissões." },
    ],
  }),
  component: Assistente,
});

const sugestoes = [
  "Quais ASOs vencem nos próximos 30 dias?",
  "Qual o turnover da Loja Shopping no trimestre?",
  "Quem está com férias vencidas?",
];

type Msg = { role: "user" | "system"; text: string };

function Assistente() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const enviar = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "system", text: "O assistente ainda não está conectado. Sua pergunta não foi enviada a nenhum serviço de IA." }]);
    setInput("");
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Assistente de IA" description="Faça perguntas sobre os dados de RH. As respostas respeitarão o seu perfil de acesso." />
      <Card className="flex min-h-[460px] flex-col shadow-none">
        <CardContent className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex-1 space-y-4">
            {msgs.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Bot className="size-6" /></div>
                <p className="max-w-sm text-sm text-muted-foreground">Exemplos do que você poderá perguntar:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {sugestoes.map((s) => (
                    <Button key={s} variant="outline" size="sm" onClick={() => enviar(s)}>{s}</Button>
                  ))}
                </div>
              </div>
            ) : msgs.map((m, i) => (
              m.role === "user"
                ? <div key={i} className="ml-auto max-w-[80%] rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.text}</div>
                : <div key={i} className="max-w-[80%] rounded-lg border border-dashed border-info/40 bg-info/5 px-4 py-2.5 text-sm text-muted-foreground">{m.text}</div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); enviar(input); }} className="flex items-end gap-2 rounded-lg border bg-background p-2">
            <Textarea autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite sua pergunta..."
              className="min-h-[44px] resize-none border-0 shadow-none focus-visible:ring-0"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(input); } }} />
            <Button type="submit" size="icon" aria-label="Enviar"><SendHorizontal /></Button>
          </form>
        </CardContent>
      </Card>
      <FutureNotice>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4" /> Integração com a OpenAI será feita pelo servidor:</span>{" "}
        a chave ficará protegida, e a IA só consultará dados por funções autorizadas para o perfil do usuário logado.
      </FutureNotice>
    </div>
  );
}
