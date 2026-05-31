# Subagents

This project is built with **subagent-driven development**: the orchestrator works through the plan one task at a time, and for each task it dispatches fresh subagents so each starts with clean, curated context.

All three roles run on Claude Code's built-in **`general-purpose`** agent — there is no custom agent binary to install. What makes each a distinct "subagent" is the **role prompt** it's dispatched with. Those prompts are vendored here:

| File | Role | When it runs |
| --- | --- | --- |
| [`implementer.md`](implementer.md) | **Implementer** — builds one task test-first, self-reviews, commits | Once per task |
| [`spec-reviewer.md`](spec-reviewer.md) | **Spec-compliance reviewer** — verifies the code matches the task spec (nothing missing, nothing extra), by reading the code, not trusting the report | After the implementer reports DONE |
| [`code-quality-reviewer.md`](code-quality-reviewer.md) | **Code-quality reviewer** — clarity, naming, tests, maintainability over the task's commit range | Only after spec compliance passes |

## The loop (per task)

```
implementer  →  spec-reviewer  →  (fix loop)  →  code-quality-reviewer  →  (fix loop)  →  next task
```

Reviewers report issues → the implementer fixes → re-review → repeat until clean. The orchestrator never moves to the next task with an open review issue. Model selection: cheap/fast for mechanical tasks, stronger for judgment/review.

## How to use

These are dispatch **prompt templates**, not standalone configs. The orchestrator (the main Claude session running the plan) fills in the `[FULL TEXT of task]`, context, and commit SHAs, then dispatches the `general-purpose` agent with the filled-in prompt. See `skills/workflow/subagent-driven-development/SKILL.md` for the full process and the original templates.

## Source / credit

Vendored from Anthropic's official **superpowers** plugin, skill `subagent-driven-development` (v5.1.0). See `skills/README.md`.
