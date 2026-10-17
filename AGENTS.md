<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Demo data lives only in `src/lib/demo-data.ts` / `src/lib/modules.ts`; replace with server functions later so pages don't change shape.
- Generic module screens render via `ModulePage` from a config in `src/lib/modules.ts`; keeps 14 modules consistent.
- Navigation and per-role visibility are defined in `src/lib/navigation.ts`; real permission enforcement must happen server-side.
- Secrets (OpenAI, integrations) must stay server-side; the AI assistant must query data only through authorized server functions.
