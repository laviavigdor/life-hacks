# Life Hacks MVP Todo List

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

-------------

## Phase 1: Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up SQLite database with simplified schema:
```sql
CREATE TABLE diary (
    id INTEGER PRIMARY KEY,
    entry TEXT NOT NULL,
    insights JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- [ ] Add shadcn/ui
- [ ] Create single page layout
- [ ] Create test data set with variety of entries:
```json
[
  {
    "entry": "Ran 5k in 30 min",
    "created_at": "2024-03-20T10:00:00Z"
  },
  {
    "entry": "Did 3 sets of 10 pushups",
    "created_at": "2024-03-20T15:00:00Z"
  },
  {
    "entry": "Ate 200g of chicken with rice",
    "created_at": "2024-03-20T19:00:00Z"
  }
]
```

**Automated Tests:**
- [ ] Project build succeeds
- [ ] Database migrations run
- [ ] Database CRUD operations work
- [ ] Page loads without errors
- [ ] Test data successfully loads

**Human Validation:**
- [ ] UI components are visually consistent
- [ ] Layout is responsive
- [ ] Typography is readable
- [ ] Color scheme is accessible

-------------

## Phase 2: Api for user input
- [ ] Create api endpoint that receives user input
- [ ] Save input to diary table with empty insights array
- [ ] Add input validation:
  - Non-empty string
  - Maximum length check
  - Basic sanitization
- [ ] Add error handling:
  - Invalid input format
  - Database errors
  - Rate limiting

**Automated Tests:**
- [ ] API endpoint returns correct status codes
- [ ] Input validation catches all edge cases
- [ ] Database transactions are atomic
- [ ] Rate limiting works correctly
- [ ] Error responses follow schema

**Human Validation:**
None required - fully automated testing sufficient

-------------

## Phase 3: LLM Integration
- [ ] Add OpenAI integration
- [ ] Create basic insight extraction prompt
- [ ] Add error handling for API calls
- [ ] Create prompt testing suite with example inputs:
```json
{
  "test_cases": [
    {
      "input": "Ran 5k in 30 min",
      "expected_insights": ["distance", "duration", "pace"]
    },
    {
      "input": "Did 3 sets of 10 pushups",
      "expected_insights": ["sets", "reps", "exercise_type"]
    }
  ]
}
```
- [ ] Add prompt versioning system
- [ ] Create prompt iteration workflow

**Automated Tests:**
- [ ] OpenAI API connection works
- [ ] Rate limiting and retry logic works
- [ ] Response format validation
- [ ] Error handling coverage
- [ ] Prompt version control works

**Human Validation:**
- [ ] Review prompt effectiveness
- [ ] Assess edge case handling
- [ ] Evaluate prompt iterations
- [ ] Verify extraction quality

-------------

## Phase 4: Insight Extraction
- [ ] Create prompt for extracting key insights in format:
```json
{
  "timestamp": "2024-03-20T00:00:00Z",  // Parsed from relative or absolute time references
  "activity": "run",                     // The main activity being described
  "insights": [
    {
      "metric": "distance",
      "value": 5,
      "unit": "km",
      "context": "exercise.run.distance",
      "extracted_text": "ran 5k"
    },
    {
      "metric": "duration",
      "value": 30,
      "unit": "min",
      "context": "exercise.run.duration",
      "extracted_text": "in 30 min"
    },
    {
      "metric": "pace",                  // Derived metric
      "value": 6,                        // 30min/5km = 6min/km
      "unit": "min/km",
      "context": "exercise.run.pace",
      "derived_from": ["distance", "duration"],
      "extracted_text": "5k in 30 min"
    }
  ]
}
```
- [ ] Add validation for insight format
- [ ] Add support for relative time parsing (e.g., "last wednesday", "yesterday")
- [ ] Add derived metric calculation
- [ ] Save insights to DB as part of the diary entry

**Automated Tests:**
- [ ] JSON schema validation
- [ ] Timestamp parsing accuracy
- [ ] Derived metrics calculation
- [ ] Database saving integrity
- [ ] Test suite with known inputs/outputs:
```json
{
  "test_cases": [
    {
      "input": "Ran 5k in 30 min last wednesday",
      "expected": {
        "timestamp": "2024-03-20",
        "metrics": ["distance", "duration", "pace"],
        "values": [5, 30, 6],
        "units": ["km", "min", "min/km"]
      }
    }
  ]
}
```

**Human Validation:**
- [ ] Review extraction accuracy
- [ ] Verify context assignments
- [ ] Check derived metric logic
- [ ] Assess edge case handling

-------------

## Phase 5: Dynamic Taxonomy
- [ ] Implement on-the-fly taxonomy computation:
```typescript
interface MetricUsage {
  metric: string;
  context: string;
  units: Set<string>;
  examples: Array<{
    text: string;
    value: number;
    unit: string;
  }>;
  count: number;
  lastUsed: Date;
}
```
- [ ] Add sorting by usage and recency
- [ ] Create context formatter for LLM prompts
- [ ] Add basic caching for taxonomy computation

**Automated Tests:**
- [ ] Taxonomy computation correctness
- [ ] Sorting logic verification
- [ ] Cache hit/miss rates
- [ ] Memory usage monitoring
- [ ] Performance benchmarks

**Human Validation:**
- [ ] Review taxonomy organization
- [ ] Verify context relevance
- [ ] Assess disambiguation quality

-------------

## Phase 6: Bottom Input Panel
- [ ] Create fixed bottom sheet with shadow and rounded top corners
- [ ] Add auto-expanding textarea with "How can I help?" placeholder
- [ ] Create simple AI status area showing "Thinking..." and completion checkmark
- [ ] Add submit button that activates when input present

**Automated Tests:**
- [ ] Component rendering tests
- [ ] Textarea expansion logic
- [ ] Button state management
- [ ] API integration tests
- [ ] Accessibility tests

**Human Validation:**
- [ ] Review UX flow
- [ ] Verify visual feedback
- [ ] Check animation smoothness
- [ ] Assess mobile usability

-------------

## Phase 7: Basic Metrics Display
- [ ] Implement simple numeric display widget
- [ ] Add basic list view for entries
- [ ] Create simple line chart component
- [ ] Handle empty states gracefully

**Automated Tests:**
- [ ] Widget rendering tests
- [ ] Data accuracy verification
- [ ] Chart plotting correctness
- [ ] Empty state handling
- [ ] Performance monitoring

**Human Validation:**
- [ ] Review visual clarity
- [ ] Verify information hierarchy
- [ ] Assess empty state UX
- [ ] Check responsive behavior

-------------

## Phase 8: Query Processing
- [ ] Implement basic date range parsing (today, yesterday, this week)
- [ ] Add simple metric aggregations (sum, average, max)
- [ ] Create basic trend detection
- [ ] Handle common unit conversions
- [ ] Add error handling:
  - Invalid date ranges
  - Missing data
  - Incompatible units
  - Failed calculations

**Automated Tests:**
- [ ] Date parsing accuracy
- [ ] Aggregation correctness
- [ ] Unit conversion precision
- [ ] Error handling coverage
- [ ] Performance benchmarks

**Human Validation:**
- [ ] Review trend detection quality
- [ ] Verify query interpretations
- [ ] Assess result relevance

-------------

# Error Handling Strategy
- Input Validation Errors: Clear user feedback
- API Errors: Retry with backoff
- LLM Errors: Fallback to simple parsing
- Database Errors: Maintain consistency
- Calculation Errors: Return partial results with warnings

# Testing Strategy
## Automated Testing (80% coverage)
- Unit Tests: Core business logic
- Integration Tests: API flows
- E2E Tests: Critical user paths
- Performance Tests: Response times
- Accessibility Tests: WCAG compliance

## Human Testing (20% coverage)
- UX Review: Flow and usability
- Visual Design: Aesthetics and clarity
- Content Quality: LLM outputs
- Edge Cases: Unexpected inputs
- Accessibility: Real-world usage

# MVP Limitations
- Single user only
- Basic metric extraction
- Simple aggregations
- No authentication
- No persistent taxonomy
- Limited to basic widgets
- On-the-fly computations

# Future Enhancements (Post-MVP)
- Persistent metric taxonomy
- Complex relationship tracking
- Multiple widget types
- Advanced aggregations
- User authentication
- Performance optimizations
- Metric learning system
- Widget persistence
- Multi-user support
- Data export/import
- Mobile optimization