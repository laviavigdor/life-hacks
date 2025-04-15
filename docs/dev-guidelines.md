# Developer Agent Guidelines

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
   - Code review completed
   - Meets all phase requirements
   - No known bugs or technical debt
   - Documentation updated

3. **Merge Process**
   - Create pull request from feature branch to main
   - All checks must pass
   - Code review approved
   - Squash and merge to keep main history clean
   - Delete feature branch after successful merge

4. **Quality Gates**
   - No direct commits to main
   - Pull request required for all changes
   - All tests must pass before merge
   - Branch must be up to date with main before merge

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