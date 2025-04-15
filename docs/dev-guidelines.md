# Developer Guidelines

## Core Principles
1. **Simplicity First**
   - Start with the simplest working implementation
   - Add complexity only when necessary
   - Prefer readable code over clever solutions but use minimal code whenever possible

2. **Data Quality**
   - Maintain data consistency
   - Handle edge cases explicitly

3. **LLM Integration**
   - Include examples in prompts
   - Add context
   - Log performance metrics

4. **Error Handling**
   - Never fail silently
   - Provide meaningful errors
   - Do not implement fallbacks - we want real data at all times
   - Log with context

5. **Testing**
   - Write tests first, sanity only.

6. **UX Decisions**
   - Give immediate feedback
   - Show processing states
   - Keep interactions simple
   - Make errors actionable

## Git Workflow Guidelines
1. **Branch Management**
   - Main branch (`main`) contains only stable, production-ready code
   - All development work happens in feature branches
   - Branch naming convention: `feature/phase-{number}-{description}`
   - Example: `feature/phase-1-project-setup`

2. **Definition of Done**
   - All automated tests pass
   - Human validation completed (if required)
   - Meets all phase requirements
   - No known bugs or technical debt
   - Documentation updated

3. **Merge Process**
   - Ensure all tests pass on feature branch
   - Merge feature branch into main
   - Delete feature branch after successful merge

## Common Pitfalls
1. Don't assume input formats
2. Don't send sensitive data to LLM
3. Don't trust LLM output without validation
4. Don't block UI during processing
5. Don't skip caching opportunities
6. Don't ignore mobile users

## Decision Framework
When making changes, ask:
1. Is it essential for MVP?
2. Can it be simplified?
3. What are the maintenance costs?
4. How does it affect performance?

## Documentation Guidelines
1. **Technical Decisions**
   - Document all technical decisions in `docs/implementation-notes.md`
   - For each decision, include:
     - Context: Why the decision was needed
     - Alternatives: What options were considered
     - Decision: What was chosen and why
     - Consequences: Both positive and negative impacts
   - Update the document when decisions change

2. **Implementation Notes Structure**
   - Start with a high-level summary of the system
   - Include an architecture diagram using Mermaid.js:
     ```markdown
     # System Overview
     
     ## Architecture Diagram
     ```mermaid
     graph TD
         A[Component A] --> B[Component B]
         B --> C[Component C]
         style A fill:#f9f,stroke:#333
         style B fill:#bbf,stroke:#333
         style C fill:#bfb,stroke:#333
     ```
     ```
   - Document key components and their interactions
   - Highlight data flow and state management
   - Update diagram when architecture changes
   - Keep diagrams simple and focused on current phase

3. **Todo List Management**
   - Mark completed tasks with completion date
   - Document any deviations from original plans
   - Add new tasks discovered during implementation

4. **Phase Handoff**
   - Document all completed work at the end of each phase
   - Note any technical decisions and their rationale
   - List known limitations or technical debt
   - Update requirements for subsequent phases based on learnings
   - Document any dependencies or prerequisites added
   - Run and fix all linting issues: `npm run lint`
   - Verify build succeeds: `npm run build`
   - Only mark phase as complete when both lint and build pass

## Error Handling Strategy
- Input Validation Errors: Clear user feedback
- API Errors: Retry with backoff
- LLM Errors: Fallback to simple parsing
- Database Errors: Maintain consistency
- Calculation Errors: Return partial results with warnings

## Testing Strategy
### Automated Testing (80% coverage)
- Unit Tests: Core business logic
- Integration Tests: API flows
- E2E Tests: Critical user paths
- Performance Tests: Response times
- Accessibility Tests: WCAG compliance

### Human Testing (20% coverage)
- UX Review: Flow and usability
- Visual Design: Aesthetics and clarity
- Content Quality: LLM outputs
- Edge Cases: Unexpected inputs
- Accessibility: Real-world usage
