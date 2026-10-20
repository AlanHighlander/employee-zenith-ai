
import { z } from "zod";

const dataOpcional = z
  .string()
  .trim()
  .refine(
    (valor) =>
      valor === "" ||
      (/^\d{4}-\d{2}-\d{2}$/.test(valor) &&
        !Number.isNaN(Date.parse(valor)) &&
        new Date(`${valor}T00:00:00Z`)
          .toISOString()
          .slice(0, 10) === valor),
    "Informe uma data válida."
  );

export const funcionarioSchema = z
  .object({
    matricula: z
      .string()
      .trim()
      .min(1, "Informe a matrícula.")
      .max(30, "A matrícula deve ter até 30 caracteres."),

    nome: z
      .string()
      .trim()
      .min(3, "Informe o nome completo.")
      .max(150, "O nome deve ter até 150 caracteres."),

    lojaId: z.string().uuid("Selecione uma loja válida."),

    cargo: z
      .string()
      .trim()
      .max(100, "O cargo deve ter até 100 caracteres."),

    admissao: dataOpcional,

    desligamento: dataOpcional,

    situacao: z.enum(["ativo", "afastado", "desligado"]),

    salario: z
      .number()
      .finite("Informe um salário válido.")
      .min(0, "O salário não pode ser negativo.")
      .nullable(),
  })
  .superRefine((dados, ctx) => {
    if (
      dados.desligamento &&
      dados.admissao &&
      dados.desligamento < dados.admissao
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["desligamento"],
        message: "O desligamento não pode ser anterior à admissão.",
      });
    }

    if (dados.situacao === "desligado" && !dados.desligamento) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["desligamento"],
        message: "Informe a data de desligamento.",
      });
    }

    if (dados.situacao !== "desligado" && dados.desligamento) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["desligamento"],
        message: "A data de desligamento exige situação Desligado.",
      });
    }

    if (
      dados.salario !== null &&
      Math.round(dados.salario * 100) / 100 !== dados.salario
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salario"],
        message: "O salário deve ter no máximo duas casas decimais.",
      });
    }
  });

export type DadosFuncionario = z.infer<typeof funcionarioSchema>;
