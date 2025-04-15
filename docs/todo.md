# Life Hacks MVP Todo List

> For development guidelines, principles, and best practices, see [Developer Guidelines](./dev-guidelines.md)

## Phase 1: Setup ✅
- [x] Initialize Next.js project with TypeScript
- [x] Add shadcn/ui
- [x] Set up SQLite database with schema
- [x] Create single page layout
- [x] Create test data set
- [x] Project build succeeds
- [x] Dependencies verified
- [x] Database migrations run
- [x] Database CRUD operations work
- [x] Page loads without errors
- [x] Test data successfully loads

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

## Phase 3: LLM Integration
- [ ] Add OpenAI integration
- [ ] Create basic insight extraction prompt
- [ ] Add error handling for API calls
- [ ] Create prompt testing suite
- [ ] Add prompt versioning system
- [ ] Create prompt iteration workflow

## Phase 4: Insight Extraction
- [ ] Create prompt for extracting key insights
- [ ] Add validation for insight format
- [ ] Add support for relative time parsing
- [ ] Add derived metric calculation
- [ ] Save insights to DB as part of the diary entry

## Phase 5: Dynamic Taxonomy
- [ ] Implement on-the-fly taxonomy computation
- [ ] Add sorting by usage and recency
- [ ] Create context formatter for LLM prompts
- [ ] Add basic caching for taxonomy computation

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