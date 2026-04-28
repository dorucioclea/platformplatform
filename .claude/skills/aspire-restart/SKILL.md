---
name: aspire-restart
description: Start or restart the .NET Aspire AppHost via the developer CLI. Always use this, never the developer CLI's `run` command, `aspire run`, or `aspire restart`.
---

# Restart Aspire

```bash
dotnet run --project developer-cli -- restart [<basePort>]
```

Use `developer-cli` exactly as written - do not expand to an absolute worktree path.

Stops any running Aspire AppHost and starts a fresh instance. Detached by default - the CLI returns immediately while Aspire keeps running.

Always use `restart`, even when nothing is running yet. It is a no-op when Aspire is not up, and the safe default in every other case. Never use the developer CLI's `run` command, `aspire run`, or `aspire restart`.

- `<basePort>` - optional positional argument; written to `.workspace/port.txt` before Aspire starts
- `--public-url <url>` - set `PUBLIC_URL` (e.g. an ngrok URL)

## When to use

- After backend or frontend changes - `restart` is the safe default; it works whether Aspire is up or not.
- To run database migrations.
- When hot reload breaks or stops picking up changes.
- Before running e2e tests on a fresh stack.

## Picking the base port

- In the git root: omit `<basePort>` (uses the default).
- In a worktree: on the first start, pick the first free port from `10000`, `11000`, `12000`, `13000` (`lsof -i :<port>` on macOS/Linux, `netstat -ano | findstr :<port>` on Windows). Keep using that port for the lifetime of the worktree - never change it after.

## Output is fire-and-forget

The CLI prints `Aspire is restarting on https://app.dev.localhost:<port>` and exits before Aspire is fully ready.

## Stopping Aspire

To stop without restarting, run `dotnet run --project developer-cli -- stop`. Rarely needed - prefer `restart` for everyday use.
