
import { createServerFn } from "@tanstack/react-start";
import { funcionarioSchema } from "./validar-funcionario";
import { getSupabaseServer } from "./server/auth/supabase-server";

export const criarFuncionario = createServerFn({ method: "POST" })
  .inputValidator(funcionarioSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServer();

    // Identifica o usuário pela sessão autenticada.
    const {
      data: { user },
      error: erroAuth,
    } = await supabase.auth.getUser();

    if (erroAuth || !user) {
      throw new Error("Sessão inválida. Entre novamente no sistema.");
    }

    // Consulta o perfil real do usuário.
    const { data: perfil, error: erroPerfil } = await supabase
      .from("profiles")
      .select("company_id, role, active, must_change_password")
      .eq("user_id", user.id)
      .maybeSingle();

    if (erroPerfil || !perfil || !perfil.active) {
      throw new Error("Usuário sem acesso ao sistema.");
    }

    if (perfil.must_change_password) {
      throw new Error("Altere sua senha antes de cadastrar funcionários.");
    }

    if (!["admin", "rh", "diretoria"].includes(perfil.role)) {
      throw new Error("Você não tem permissão para cadastrar funcionários.");
    }

    // Confirma que a loja pertence à empresa do usuário.
    const { data: loja, error: erroLoja } = await supabase
      .from("stores")
      .select("id")
      .eq("id", data.lojaId)
      .eq("company_id", perfil.company_id)
      .eq("active", true)
      .maybeSingle();

    if (erroLoja || !loja) {
      throw new Error("Loja inválida ou sem permissão de acesso.");
    }

    // Grava usando a sessão do usuário, respeitando o RLS.
    const { data: funcionario, error: erroCadastro } = await supabase
      .from("employees")
      .insert({
        company_id: perfil.company_id,
        store_id: loja.id,
        employee_code: data.matricula,
        full_name: data.nome,
        job_title: data.cargo || null,
        admission_date: data.admissao || null,
        termination_date: data.desligamento || null,
        status: data.situacao,
        salary: data.salario,
      })
      .select("id, employee_code, full_name")
      .single();

    if (erroCadastro) {
      console.error("Erro ao cadastrar funcionário:", erroCadastro.code);

      if (erroCadastro.code === "23505") {
        throw new Error("Já existe um funcionário com essa matrícula.");
      }

      throw new Error("Não foi possível cadastrar o funcionário.");
    }

    return {
      sucesso: true,
      mensagem: "Funcionário cadastrado com sucesso!",
      funcionario,
    };
  });
