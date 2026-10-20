
import { useState, type FormEvent } from "react";
import { useScope } from "@/lib/scope-context";
import { criarFuncionario } from "@/lib/criar-funcionario";

export function FormularioFuncionario() {
  const { lojasPermitidas } = useScope();
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function enviarFormulario(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (salvando) return;

    const formulario = evento.currentTarget;
    const campos = new FormData(formulario);

    const salarioTexto = String(
      campos.get("salario") ?? ""
    ).trim();

    setSalvando(true);
    setMensagem("");

    try {
      const resultado = await criarFuncionario({
        data: {
          matricula: String(campos.get("matricula") ?? ""),
          nome: String(campos.get("nome") ?? ""),
          lojaId: String(campos.get("loja") ?? ""),
          cargo: String(campos.get("cargo") ?? ""),
          admissao: String(campos.get("admissao") ?? ""),
          desligamento: String(
            campos.get("desligamento") ?? ""
          ),
          situacao: String(
            campos.get("situacao") ?? "ativo"
          ) as "ativo" | "afastado" | "desligado",
          salario:
            salarioTexto === ""
              ? null
              : Number(salarioTexto),
        },
      });

      if (resultado.sucesso) {
        setMensagem(resultado.mensagem);
        formulario.reset();
      }
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Não foi possível cadastrar o funcionário."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Cadastrar funcionário
        </h2>
        <p className="text-sm text-muted-foreground">
          Preencha os dados do funcionário.
        </p>
      </div>

      <form
        onSubmit={enviarFormulario}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label htmlFor="matricula" className="text-sm font-medium">
            Matrícula *
          </label>
          <input
            id="matricula"
            name="matricula"
            type="text"
            required
            maxLength={30}
            placeholder="Ex.: 000123"
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium">
            Nome completo *
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            minLength={3}
            maxLength={150}
            placeholder="Digite o nome completo"
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="loja" className="text-sm font-medium">
            Loja *
          </label>
          <select
            id="loja"
            name="loja"
            required
            defaultValue=""
            className="w-full rounded-md border bg-background px-3 py-2"
          >
            <option value="" disabled>
              Selecione a loja
            </option>
            {lojasPermitidas.map((loja) => (
              <option key={loja.id} value={loja.id}>
                {loja.codigo} - {loja.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="cargo" className="text-sm font-medium">
            Cargo
          </label>
          <input
            id="cargo"
            name="cargo"
            type="text"
            maxLength={100}
            placeholder="Ex.: Operador de caixa"
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="admissao" className="text-sm font-medium">
            Data de admissão
          </label>
          <input
            id="admissao"
            name="admissao"
            type="date"
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="situacao" className="text-sm font-medium">
            Situação *
          </label>
          <select
            id="situacao"
            name="situacao"
            defaultValue="ativo"
            required
            className="w-full rounded-md border bg-background px-3 py-2"
          >
            <option value="ativo">Ativo</option>
            <option value="afastado">Afastado</option>
            <option value="desligado">Desligado</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="desligamento" className="text-sm font-medium">
            Data de desligamento
          </label>
          <input
            id="desligamento"
            name="desligamento"
            type="date"
            className="w-full rounded-md border bg-background px-3 py-2"
          />
          <p className="text-xs text-muted-foreground">
            Obrigatória quando a situação for Desligado.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="salario" className="text-sm font-medium">
            Salário (R$)
          </label>
          <input
            id="salario"
            name="salario"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex.: 2500.00"
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={salvando || lojasPermitidas.length === 0}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando
            ? "Salvando..."
            : "Cadastrar funcionário"}
        </button>

        {mensagem && (
          <p role="status" className="text-sm">
            {mensagem}
          </p>
        )}
      </form>
    </div>
  );
}
