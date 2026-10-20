
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  funcionarioId: string;
};

type ResultadoSalario = {
  employee_id: string;
  current_salary: number | null;
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function SalarioAtualFuncionario({
  funcionarioId,
}: Props) {
  const [salario, setSalario] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [semPermissao, setSemPermissao] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function consultarSalario() {
      setCarregando(true);
      setErro("");
      setSemPermissao(false);
      setSalario(null);

      const { data, error } = await supabase.rpc(
        "consultar_salario_funcionario",
        {
          p_employee_id: funcionarioId,
        }
      );

      if (!ativo) return;

      if (error) {
        if (
          error.message.includes(
            "Sem permissão para consultar salários"
          )
        ) {
          setSemPermissao(true);
        } else {
          setErro("Não foi possível consultar o salário.");
        }

        setCarregando(false);
        return;
      }

      const registros = (data ?? []) as ResultadoSalario[];
      setSalario(registros[0]?.current_salary ?? null);
      setCarregando(false);
    }

    void consultarSalario();

    return () => {
      ativo = false;
    };
  }, [funcionarioId]);

  if (semPermissao) {
    return null;
  }

  return (
    <div className="rounded-lg border p-5">
      <h3 className="text-lg font-semibold">
        Salário atual
      </h3>

      {carregando ? (
        <p className="mt-2 text-sm">
          Consultando salário...
        </p>
      ) : erro ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {erro}
        </p>
      ) : (
        <p className="mt-3 text-2xl font-semibold">
          {salario === null
            ? "Não informado"
            : formatarMoeda(salario)}
        </p>
      )}
    </div>
  );
}
