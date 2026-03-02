# VirtualSoftwareCompany Skills

A collection of 8 AI agent skills that work together to simulate a virtual software company development workflow.

## Skills Overview

| Skill | Command | Role |
|-------|---------|------|
| company-run | `/company-run` | Main orchestrator - coordinates workflow |
| pm | `/pm` | Project Manager - requirements analysis |
| architect | `/architect` | Software Architect - architecture design |
| dev-tester | `/dev-tester` | Development Tester - DT test design (TDD) |
| developer | `/developer` | Developer - code implementation |
| reviewer | `/reviewer` | Code Reviewer - code review |
| test-manager | `/test-manager` | Test Manager - test planning |
| tester | `/tester` | Tester - test execution |

## Workflow

```
User Request
    │
    ▼
┌─────────────────┐
│  /pm            │ Requirements Analysis
│  01-requirements│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  /architect     │ Architecture Design
│  02-architecture│
│  03-acceptance   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│/dev-  │ │/test- │
│tester │ │manager│
│04-dt- │ │07-test│
│tests  │ │design │
└───┬───┘ └───┬───┘
    │         │
    ▼         │
┌───────┐     │
│/dev-  │     │
│eloper │     │
│05-code│     │
└───┬───┘     │
    │         │
    ▼         │
┌───────┐     │
│/review│     │
│er     │     │
│06-    │     │
│reviews│     │
└───┬───┘     │
    │         │
    ▼         │
┌───────┬─────┘
│/tester│
│08-test│
│cases  │
│09-    │
│reports│
└───┬───┘
    │
    ▼
  Done
```

## Usage

### Start a new project
```bash
/company-run "Develop a todo app"
```

### Continue an existing project
```bash
/company-run todo-app
```

### Check project status
```bash
/company-run todo-app --status
```

## Project Structure

```
projects/{project-name}/
├── 01-requirements/    # Requirements documents
├── 02-architecture/    # Architecture design
├── 03-acceptance/      # Acceptance criteria
├── 04-dt-tests/        # DT test cases (TDD)
├── 05-code/            # Source code
├── 06-reviews/         # Code review records
├── 07-test-design/     # Test design documents
├── 08-test-cases/      # Test cases
└── 09-reports/         # Test reports
```

## Configuration

The skills read configuration from:
- `company-config/code-standards.yaml` - Code standards
- `company-config/architecture-patterns.yaml` - Architecture patterns
- `company-config/test-standards.yaml` - Test standards
- `company-config/role-boundaries.yaml` - Role boundaries

## License

MIT
