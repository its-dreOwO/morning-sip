# Skills used to build morning-sip

This directory bundles the **Claude Code skills** this project was built with, so a fresh session (or a different machine) can resume the workflow without re-installing them. They are vendored here for continuity/reference.

## Contents

### `workflow/` — process skills (Anthropic "superpowers" plugin)

The build follows a brainstorm → spec → plan → subagent-driven, test-first execution pipeline:

| Skill | Role in this project |
| --- | --- |
| `using-superpowers` | Entry point — how to find/use skills |
| `brainstorming` | Used to shape the design spec |
| `writing-plans` | Produced `docs/superpowers/plans/2026-05-31-morning-dashboard.md` |
| `subagent-driven-development` | **The active execution loop** — fresh implementer subagent per task + two-stage (spec → quality) review |
| `executing-plans` | Alternative (parallel-session) executor |
| `test-driven-development` | Each widget is built test-first |
| `requesting-code-review` / `receiving-code-review` | The reviewer subagent templates |
| `finishing-a-development-branch` | Run after all tasks complete |
| `using-git-worktrees` | Isolated workspace setup |
| `verification-before-completion` | Final-check discipline |

### `design/` — design & animation skills

| Skill | Role |
| --- | --- |
| `web-design-engineer` | Overall visual/design engineering guidance |
| `modern-web-design` | Modern web design patterns |
| `motion-framer` | Framer Motion animation patterns (widget entrance/hover, count-ups) |
| `animated-component-libraries` | Animated component patterns |
| `lottie-animations` | Lottie (`lottie-react`) animation guidance |

## How to use them

Skills are normally discovered by Claude Code from `~/.claude/skills/` (personal) or plugin caches. To use these in a fresh environment, copy the skill folders into your skills directory:

```bash
# design + animation skills
cp -r skills/design/*    ~/.claude/skills/
# workflow skills (or install the official "superpowers" plugin instead)
cp -r skills/workflow/*  ~/.claude/skills/
```

Then invoke a skill with the `Skill` tool (e.g. `subagent-driven-development`) or via `/<skill-name>` when it's user-invocable.

## Sources / credits

- **workflow/** — Anthropic's official **superpowers** plugin (`claude-plugins-official`), v5.1.0.
- **design/** — `web-design-engineer` from [ConardLi/garden-skills](https://github.com/ConardLi/garden-skills); the animation skills (`motion-framer`, `lottie-animations`, `animated-component-libraries`, `modern-web-design`) from [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills).

These are vendored unmodified for this project's continuity; refer to each upstream repo for license terms.
