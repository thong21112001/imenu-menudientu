# Language Policy

## 1. User Communication

The agent may communicate with the user in the user's preferred language.

When the user communicates in Vietnamese, use Vietnamese for explanations, questions, confirmations, and summaries unless another language is explicitly requested.

---

## 2. AI and Sub-Agent Instructions

All instructions sent to:

- AI models
- Sub-agents
- AI coding agents
- AI-powered tools

MUST be written in English.

If the user's request is written in Vietnamese or another language:

1. Understand the original request.
2. Preserve the original intent.
3. Preserve all constraints and restrictions.
4. Translate and normalize the instruction into precise technical English.
5. Send the English instruction to the AI system or sub-agent.

Do not change the user's requirements during translation.

---

## 3. Meaning Preservation

The normalized English instruction MUST preserve:

- User intent
- Task scope
- Expected behavior
- Technical requirements
- Constraints
- Restrictions
- Security requirements
- Permission requirements
- Acceptance criteria

Do not remove details merely to make the prompt shorter.

Do not invent requirements that were not present in the original request.

---

## 4. Technical Terminology

Keep technical identifiers and established technical terminology precise.

Do not translate:

- File names
- Directory names
- Variable names
- Function names
- Class names
- Interfaces
- Types
- API endpoints
- Package names
- Framework names
- Library names
- Programming keywords
- CLI commands

Use the original technical identifier exactly when referring to it.

---

## 5. AI Prompt Quality

Before sending an instruction to another AI system, make sure the instruction is:

- Clear
- Specific
- Technically precise
- Unambiguous
- Consistent with the project rules
- Explicit about important constraints

When useful, structure the English prompt into:

```text
Context
Task
Requirements
Constraints
Files/Scope
Acceptance Criteria
Output Requirements
```

---

## 6. No Language Drift

Do not silently:

- Change Vietnamese requirements into weaker English requirements.
- Omit restrictions.
- Change requested behavior.
- Add implementation decisions that were not requested.
- Translate technical identifiers incorrectly.

The English instruction is a faithful technical normalization of the user's request.
