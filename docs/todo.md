# Life Hacks MVP Todo List

For developer guidelines, coding standards, and workflow processes, please refer to [Developer Guidelines](./dev-guidelines.md).

-------------

## Phase 1: Setup ✅
- [x] Initialize Next.js project with TypeScript
- [x] Set up SQLite database with simplified schema:
```sql
CREATE TABLE diary (
    id INTEGER PRIMARY KEY,
    entry TEXT NOT NULL,
    insights JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- [x] Add shadcn/ui
- [x] Create single page layout
- [x] Create test data set with variety of entries:
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
- [x] Project build succeeds
- [x] Database migrations run
- [x] Database CRUD operations work
- [x] Page loads without errors
- [x] Test data successfully loads

**Human Validation:**
- [x] UI components are visually consistent
- [x] Layout is responsive
- [x] Typography is readable
- [x] Color scheme is accessible

-------------

## Phase 2: Api for user input ✅
- [x] Create api endpoint that receives user input
- [x] Save input to diary table with empty insights array
- [x] Add input validation:
  - Non-empty string
  - Maximum length check
  - Basic sanitization
- [x] Add error handling:
  - Invalid input format
  - Database errors
  - Rate limiting

## Phase 3: LLM Integration ✅
- [x] Add OpenAI integration
- [x] Create basic insight extraction prompt
- [x] Add error handling for API calls

## Phase 4: Insight Extraction ✅
- [x] Create prompt for extracting key insights
- [x] Add validation for insight format
- [x] Add support for relative time parsing
- [x] Add derived metric calculation
- [x] Save insights to DB as part of the diary entry

## Phase 5: Dynamic Taxonomy ✅
- [x] Implement on-the-fly taxonomy computation
- [x] Add sorting by usage and recency
- [x] Create context formatter for LLM prompts
- [x] Add basic caching for taxonomy computation

## Phase 6: Bottom Input Panel
- [ ] Create fixed bottom sheet with shadow and rounded top corners
- [ ] Add auto-expanding textarea with "How can I help?" placeholder
- [ ] Create simple AI status area showing "Thinking..." and completion checkmark
- [ ] Add submit button that activates when input present

## Phase 7: Basic Metrics Display
- [ ] Implement simple numeric display widget
- [ ] Add basic list view for entries
- [ ] Create simple line chart component
- [ ] Handle empty states gracefully

## Phase 8: Query Processing
- [ ] Implement basic date range parsing
- [ ] Add simple metric aggregations
- [ ] Create basic trend detection
- [ ] Handle common unit conversions
- [ ] Add error handling:
  - Invalid date ranges
  - Missing data
  - Incompatible units
  - Failed calculations

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