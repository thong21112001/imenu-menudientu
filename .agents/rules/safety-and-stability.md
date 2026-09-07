# Safety, Stability, Security & Permission Rules

## 1. Core Stability

Existing working behavior must be preserved.

Any new or modified code MUST NOT unnecessarily change:

- Existing business logic
- Existing application flow
- Existing API behavior
- Existing DTO contracts
- Existing response structures
- Existing UI behavior
- Existing authentication behavior
- Existing authorization behavior
- Existing data contracts

Only modify behavior explicitly required by the user's request or strictly necessary to complete the task.

---

## 2. Minimal Change Principle

Always make the smallest safe change that completely solves the requested problem.

Do not:

- Refactor unrelated code.
- Rename unrelated variables.
- Reformat unrelated files.
- Upgrade dependencies unnecessarily.
- Replace working implementations for stylistic reasons.
- Change architecture without authorization.
- Remove code merely because it appears unused without verifying its scope.

---

## 3. Environment Files

The following files are protected:

```text
.env
.env.local
.env.development
.env.production
.env.test
```

The same protection applies to other files whose primary purpose is to store secrets or credentials.

The agent MUST NOT automatically:

- Read protected environment files.
- Print their contents.
- Extract secret values.
- Copy or export secret values.
- Modify protected environment files.
- Send secret values to AI systems, sub-agents, tools, or external services.
- Include secret values in source code, logs, documentation, responses, or commits.

If access is genuinely required:

1. Explain why the access is necessary.
2. Ask the user for explicit permission before reading or modifying the protected file.
3. Access only the minimum information required.
4. Avoid exposing the value itself whenever possible.
5. Do not retain or redistribute secret values unnecessarily.

---

## 4. Secrets and Credentials

Treat the following as sensitive:

- API keys
- Access tokens
- Passwords
- Database credentials
- Private keys
- Signing keys
- Authentication secrets
- Session secrets
- OAuth client secrets
- Service-account credentials

Never expose sensitive values through:

- Chat responses
- AI prompts
- Logs
- Debug output
- Screenshots
- Source code
- Documentation
- Git commits
- Generated artifacts

---

## 5. Git Workflow

Git is user-controlled by default.

### Read-only inspection

The agent may perform non-destructive inspection when necessary, such as:

```bash
git status
git diff
git log
git branch
git remote -v
```

### Commit

The agent MUST NOT create a Git commit automatically.

Default workflow:

```text
AI implements
    ↓
AI validates
    ↓
AI reports changes
    ↓
USER REVIEWS
    ↓
USER COMMITS
```

The user is responsible for the final commit unless they explicitly delegate the operation.

Even when the user asks the agent to create a commit, obtain explicit confirmation immediately before the commit if the previous instruction was not an unambiguous authorization to execute it.

### Push

The agent MUST NOT push to any remote repository automatically.

The user remains responsible for pushing unless explicit authorization is given.

---

## 6. Destructive Git Operations

The following operations require explicit permission before execution:

```bash
git reset --hard
git clean
git restore
git checkout -- <file>
git rebase
git push --force
git branch -D
```

Before execution:

1. Explain what the operation will do.
2. Explain the relevant risk, such as data or history loss.
3. Ask for explicit confirmation.
4. Execute only after confirmation.

---

## 7. File Deletion and Destructive Operations

Do not delete project files automatically unless:

- The user explicitly requests deletion, or
- The deletion is clearly required by the requested task and has no meaningful unexpected impact.

When deletion could affect multiple applications, shared packages, configuration, or project history, ask for confirmation first.

Never use broad destructive cleanup commands merely to resolve a local implementation issue.

---

## 8. Database and External Systems

Do not execute destructive operations against databases or external systems without explicit authorization.

Examples include:

- DROP
- TRUNCATE
- Broad DELETE operations
- Reset operations
- Destructive migrations
- Production data modifications
- Destructive cloud or infrastructure changes

---

## 9. Existing Configuration

Do not silently replace or weaken existing configuration in order to make the project build.

Preserve:

- Existing environment strategy
- Existing build configuration
- Existing lint configuration
- Existing TypeScript configuration
- Existing workspace configuration
- Existing deployment configuration

When a configuration change is required, change only the relevant portion and explain it.

---

## 10. Permissions and Confirmation Gates

The agent MUST ask for permission before:

- Reading `.env` or secret-bearing files.
- Modifying `.env` or secret-bearing files.
- Creating Git commits when authorization is not already explicit.
- Pushing to remotes.
- Executing destructive Git commands.
- Deleting important files.
- Performing destructive data operations.
- Making major architectural changes.
- Performing meaningful operations outside the project workspace.

If permission is required, stop before execution.

---

## 11. Transparency

Always state what actually happened.

Never claim:

- A test passed when it was not run.
- A build succeeded when it was not run.
- A file was changed when it was not changed.
- A commit was created when it was not created.
- Code was deployed when it was not deployed.
- An API was verified when it was not verified.

When validation cannot be performed, state that clearly.

---

## 12. Security Principle

When uncertain between a safe action and a potentially destructive or sensitive action:

```text
Stop → Explain → Ask permission → Execute the minimum required action
```
