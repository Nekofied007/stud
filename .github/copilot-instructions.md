# Frappe Learning (LMS) - AI Agent Instructions

## Architecture Overview

**Hybrid Stack**: Frappe Learning is a dual-architecture app built on the Frappe Framework with a modern Vue 3 frontend.

- **Backend**: Python-based Frappe app (`lms/` directory) - handles data models (DocTypes), API endpoints, business logic, and server-side rendering
- **Frontend**: Vue 3 SPA (`frontend/` directory) - modern UI built with Frappe UI library, Vite, and Tailwind CSS
- **Bridge**: The frontend mounts at `/lms` route via `frontend/src/router.js` with `base: '/lms'`. Build output goes to `lms/public/frontend/` and entry HTML copies to `lms/www/lms.html`

### Key Architectural Patterns

1. **DocTypes as Data Models**: All entities (courses, batches, lessons, quizzes, certificates) are Frappe DocTypes in `lms/lms/doctype/`. Each has `.json` schema and `.py` controller with validation/hooks.

2. **Whitelist API Pattern**: Backend APIs in `lms/lms/api.py` use `@frappe.whitelist()` decorator. Frontend calls these via `frappe-ui`'s `createResource()`. Example:
   ```python
   @frappe.whitelist()
   def get_user_info():
       return {"user": frappe.session.user}
   ```
   ```javascript
   const userResource = createResource({
       url: 'lms.lms.api.get_user_info',
       auto: true
   })
   ```

3. **3-Level Content Hierarchy**: Course → Chapter → Lesson. Managed via `lms_course`, `course_chapter`, and `course_lesson` doctypes. Navigation uses `chapterNumber-lessonNumber` format (e.g., `/courses/intro-py/learn/1-3`).

4. **Page Renderers**: Custom routing via `lms/page_renderers.py` handles special paths like SCORM content (`scorm/`). These extend `BaseRenderer` from Frappe.

5. **Widget System**: Reusable Jinja templates in `lms/widgets.py`. Access via `{{widgets.WidgetName()}}` in templates. Search path: `lms/` module.

## Development Workflows

### Setup & Running

**Install**: Use Frappe bench system or Docker compose. Docker quickstart:
```bash
cd lms/docker
docker compose up -d
# Access at http://lms.localhost:8000/lms
# Default: Administrator/admin
```

**Development**:
- Backend changes: Auto-reload with `bench start` or Docker watch mode
- Frontend dev server: `cd frontend && yarn dev` (runs on :8080, proxies to :8000)
- **Critical**: Set `"ignore_csrf": 1` in `site_config.json` for frontend dev to prevent CSRF errors
- Build for production: `yarn build` (outputs to `lms/public/frontend/`, copies HTML to `lms/www/lms.html`)

### Testing

- **E2E Tests**: Cypress in `cypress/e2e/`. Run with `yarn test-local` (opens browser) or CI via `cypress run`
- **Config**: See `cypress.config.js` - uses custom commands in `cypress/support/commands.js` (e.g., `cy.login()`, `cy.closeOnboardingModal()`)
- **No Python unit tests**: Project relies primarily on integration testing via Cypress

### Database & Migrations

- **Fixtures**: Loaded via `fixtures = ["Custom Field", "Function", "Industry", "LMS Category"]` in `hooks.py`
- **Patches**: Version-specific migrations in `lms/patches/` (e.g., `v2_0/`, `replace_member_with_user_*.py`)
- **After Install**: `lms/install.py` creates roles (Course Creator, Moderator, Batch Evaluator, LMS Student) and sets permissions

## Critical Conventions

### Frontend State Management

- **Pinia Stores**: All in `frontend/src/stores/` - `user.js` (auth), `session.js` (login/logout), `settings.js`, `sidebar.js`
- **Frappe UI Resources**: Use `createResource()` for all API calls. Supports caching, auto-fetch, loading states:
  ```javascript
  const courses = createResource({
      url: 'lms.lms.api.get_courses',
      cache: ['courses', props.filters],  // Cache by key
      auto: false  // Manual fetch
  })
  ```

### Backend Hooks System

Key hooks in `lms/hooks.py`:
- **Doc Events**: `doc_events` dict hooks into DocType lifecycle (e.g., badge processing on any doc change)
- **Scheduled Tasks**: `scheduler_events` - hourly cert evals/stats, daily reminders
- **Web Assets**: `web_include_css = "lms.bundle.css"` - bundles built from `lms/public/`
- **Override Classes**: `override_doctype_class` for extending Frappe core (e.g., Custom Web Template)

### Role & Permission Model

- **Desk Access Disabled**: All LMS roles have `desk_access=0` (web-only, no Frappe Desk UI)
- **Roles**: Course Creator (create courses), Moderator (manage content), Batch Evaluator (grade), LMS Student (learner)
- **Programmatic Assignment**: `give_discussions_permission()` in `install.py` grants forum access

## Integration Points

### External Services

1. **Zoom**: Integration via `lms_zoom_settings` doctype. Live classes link to Zoom meetings.
2. **Razorpay**: Payment gateway for paid courses/certificates. Requires `razorpay` dependency (see `pyproject.toml`).
3. **Frappe Cloud**: Billing integration via `frappe.integrations.frappe_providers.frappecloud_billing`.
4. **Unsplash**: Image search in `lms/unsplash.py` for course images.

### SCORM Support

- Upload SCORM packages as lessons
- Custom renderer in `lms/page_renderers.py` serves SCORM content from `public/scorm/`
- Handles missing files by walking directory tree to find correct paths

### Socket.IO Realtime

- Frontend initializes socket in `frontend/src/socket.js`: `initSocket()`
- Provides via `app.provide('$socket', initSocket())`
- Used for notifications (`lms/lms/utils.py::publish_notifications`)

## File Locations Reference

- **Core API**: `lms/lms/api.py` (1600+ lines of whitelisted methods)
- **User Utils**: `lms/lms/user.py` (username validation, user creation)
- **Payments**: `lms/lms/payments.py` (Razorpay integration)
- **Routing**: `lms/routing.py` (RegexConverter for custom routes)
- **Frontend Router**: `frontend/src/router.js` (Vue Router, 250+ lines)
- **Main App**: `frontend/src/App.vue` + `main.js` (Pinia, i18n, Frappe UI setup)
- **Build Config**: `frontend/vite.config.js` (frappe-ui plugin, PWA, dev proxy)

## Common Pitfalls

1. **Don't use `bench` commands in production Docker**: Use Frappe Cloud or docker-compose
2. **Frontend route base must be `/lms`**: Hardcoded in router, build scripts expect this
3. **API methods need `@frappe.whitelist()`**: Unmarked methods aren't accessible from frontend
4. **CSRF in dev**: Frontend dev server needs `ignore_csrf: 1` in site config
5. **Python ≥3.10 required**: See `pyproject.toml`, uses match statements and type hints
6. **Markdown rendering**: Uses `markdown-it` on frontend, Python `markdown` lib on backend
7. **Lesson content**: Stored in `course_lesson` doctype, rendered via Editor.js format on frontend

## Code Style

- **Python**: Ruff linting (see `pyproject.toml`), line length 110, tabs for indentation
- **JavaScript**: Vue 3 Composition API, script setup, TypeScript types in `global.d.ts`
- **Commits**: Semantic commit messages (enforced by `commitlint.config.js`)
- **Pre-commit**: Configured in `package.json`, runs on git hooks
