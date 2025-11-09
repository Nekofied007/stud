# Phase 3: Frontend React SPA - IN PROGRESS

## Overview

**Status**: 🟡 In Progress  
**Start Date**: January 2025  
**Components Created**: 7 (Layout + 6 pages)  
**Target**: Build complete React frontend with routing, API integration, and responsive UI

## Goals

1. ✅ **Routing Structure** - React Router with nested routes
2. ✅ **Layout & Navigation** - Header, footer, responsive nav
3. ✅ **Core Pages** - All 6 main pages with UI scaffolding
4. ⏳ **API Integration** - Connect to FastAPI backend
5. ⏳ **State Management** - React Query for data fetching
6. ⏳ **UI Components** - Reusable components (VideoPlayer, QuizCard, etc.)
7. ⏳ **Responsive Design** - Mobile-first Tailwind CSS
8. ⏳ **Error Handling** - Loading states, error boundaries

## Architecture

### Stack

- **React**: 18.2.0 with TypeScript
- **Routing**: React Router 6.21.2 (BrowserRouter)
- **Data Fetching**: React Query 3.39.3
- **Styling**: Tailwind CSS 3.4.1
- **Build Tool**: Vite 5.0.11
- **API Client**: Axios 1.6.5

### Route Structure

```
/ (Layout wrapper)
├── /                          → HomePage (landing, hero, features)
├── /courses                   → CoursesPage (add playlist, list courses)
├── /courses/:playlistId       → CourseDetailPage (lessons list)
├── /courses/:playlistId/lessons/:videoId → LessonPage (video + transcript)
├── /quiz/:videoId             → QuizPage (MCQ quiz with feedback)
└── /tutor[/:sessionId]        → TutorPage (AI chat with RAG)
```

## Completed Work

### 1. Core Application Setup

**App.tsx** (44 lines)
- React Router configuration with BrowserRouter
- React Query client setup (refetchOnWindowFocus=false, retry=1, staleTime=5min)
- Layout wrapper with nested routes
- All route definitions with path parameters

```tsx
<QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* 6 routes defined */}
      </Route>
    </Routes>
  </BrowserRouter>
</QueryClientProvider>
```

### 2. Layout Component

**components/Layout.tsx** (100 lines)
- **Header**: STUD logo, responsive navigation (Home, Courses, AI Tutor)
- **Main**: Content area with max-width container and Outlet for child routes
- **Footer**: Copyright, links to API docs and GitHub
- **Active Route Highlighting**: Indigo background for current nav item
- **Sticky Header**: Positioned sticky for persistent navigation

**Features**:
- Responsive navigation (space-x-1 nav links)
- Active route detection using `useLocation()`
- Tailwind CSS styling with Frappe-like clean design
- External links open in new tabs

### 3. Page Components

#### **HomePage.tsx** (147 lines)
**Purpose**: Landing page with hero, features, and onboarding

**Features**:
- **Backend Health Check**: Real-time status indicator (green/red dot)
- **Hero Section**: STUD branding with tagline expansion
- **CTA Buttons**: "Browse Courses" (primary), "Try AI Tutor" (secondary)
- **Features Grid**: 3-column layout with emojis (🎥 YouTube, 📝 Quizzes, 🤖 Tutor)
- **How It Works**: 4-step numbered guide with gradient background
- **Responsive**: Mobile-first with `md:grid-cols-3` breakpoints

**API Calls**:
- `GET /health` - Backend health check on mount

---

#### **CoursesPage.tsx** (133 lines)
**Purpose**: Add playlists and browse courses

**Features**:
- **Add Playlist Form**: URL input with validation, submit button
- **Success/Error Messages**: Colored alerts (green/red) with borders
- **Loading State**: Disabled inputs during API call
- **Course List Placeholder**: Empty state with emoji 📚
- **TODO Comments**: Scaffolding for course cards with thumbnails

**API Calls**:
- `POST /api/v1/ingest/playlist` - Import YouTube playlist
- TODO: `GET /api/v1/ingest/playlists` - List all playlists

**State**:
- `playlistUrl`: Input field value
- `loading`: Submit button state
- `error`: Error message string
- `success`: Success message boolean

---

#### **CourseDetailPage.tsx** (83 lines)
**Purpose**: Display playlist metadata and lesson list

**Features**:
- **Breadcrumb Navigation**: Courses > Course Details
- **Course Header**: Title, description, stats (videos, duration, completion %)
- **Lessons List Placeholder**: Loading state with emoji 🎬
- **TODO Comments**: Scaffolding for lesson cards with status badges

**API Calls** (TODO):
- `GET /api/v1/ingest/playlist/{id}` - Playlist metadata
- `GET /api/v1/ingest/playlist/{id}/videos` - Video list
- `GET /api/v1/transcribe/video/{id}/status` - Transcription status

**URL Parameters**:
- `playlistId`: Playlist identifier from route

---

#### **LessonPage.tsx** (113 lines)
**Purpose**: Video player with transcript and action buttons (PRIORITY PAGE)

**Features**:
- **YouTube Iframe Player**: Aspect-video container, fullscreen enabled
- **Transcript Sidebar**: Sticky panel with scroll, max-h-[calc(100vh-8rem)]
- **Action Buttons**: "Take Quiz" (primary), "Ask Tutor" (secondary)
- **Breadcrumb Navigation**: Courses > Course > Lesson
- **2-Column Layout**: Video (2/3 width) + Transcript (1/3 width) on large screens
- **TODO Comments**: Timestamp sync, transcript segments with click handlers

**API Calls** (TODO):
- `GET /api/v1/transcribe/video/{id}` - Fetch transcript
- `GET /api/v1/quiz/status/{id}` - Check quiz availability

**URL Parameters**:
- `playlistId`: For breadcrumb navigation
- `videoId`: For YouTube embed and API calls

**Key Interactions** (TODO):
- Click transcript segment → seek video to timestamp
- "Take Quiz" → navigate to QuizPage
- "Ask Tutor" → navigate to TutorPage with video context

---

#### **QuizPage.tsx** (165 lines)
**Purpose**: Interactive MCQ quiz with instant feedback

**Features**:
- **Progress Bar**: Visual indicator (Question X of 5, Score X/5)
- **Question Card**: Difficulty badge, question text, 4 radio options
- **Answer Selection**: Radio buttons with indigo highlight
- **Feedback Panel**: Green success alert with explanation and video timestamp link
- **Navigation**: Submit Answer → Show Feedback → Next Question
- **Tip Box**: Blue info panel with quiz guidance

**API Calls** (TODO):
- `GET /api/v1/quiz/video/{id}` - Fetch quiz questions
- `POST /api/v1/quiz/video/{id}/question/{q_id}/submit` - Submit answer

**State**:
- `currentQuestion`: Index (0-4)
- `selectedAnswer`: Option index (0-3) or null
- `showFeedback`: Boolean for feedback visibility
- `score`: Total correct answers

**URL Parameters**:
- `videoId`: Quiz identifier

**Key Interactions**:
- Select option → highlight radio button
- Submit → POST answer → show feedback (correct/incorrect + explanation)
- Next → increment question index, reset selection
- Jump to video → navigate to LessonPage with timestamp param (TODO)

---

#### **TutorPage.tsx** (179 lines)
**Purpose**: AI chat interface with RAG-powered responses

**Features**:
- **Chat History**: Scrollable message area with user/assistant bubbles
- **Message Bubbles**: Right-aligned (user, indigo), left-aligned (assistant, white)
- **Source Citations**: Clickable timestamp chips below assistant messages
- **Confidence Score**: Percentage display below sources
- **Suggested Questions**: 3 quick-action buttons on empty state
- **Input Bar**: Text field + Send button, Enter key support
- **Loading Animation**: 3 bouncing dots during API call
- **Clear History Button**: Red text button in header

**API Calls** (TODO):
- `POST /api/v1/tutor/ask` - Send question
- `GET /api/v1/tutor/history/{sessionId}` - Load conversation
- `DELETE /api/v1/tutor/history/{sessionId}` - Clear history

**State**:
- `messages`: Array of Message objects (`{ role, content, sources?, confidence? }`)
- `question`: Input field value
- `loading`: Boolean for send button state

**URL Parameters**:
- `sessionId` (optional): Resume conversation
- Query param `video`: Video context for RAG retrieval

**Key Interactions**:
- Type question → press Enter or click Send → POST to API
- Display answer with timestamp sources
- Click source → navigate to LessonPage at timestamp (TODO)
- Click suggested question → populate input field
- Clear history → DELETE session → reset messages array

---

## File Structure

```
frontend/src/
├── App.tsx                     # Router + QueryClient setup
├── main.tsx                    # React entry point (unchanged)
├── index.css                   # Tailwind directives (unchanged)
├── components/
│   └── Layout.tsx              # Header, footer, navigation ✅
└── pages/
    ├── HomePage.tsx            # Landing page ✅
    ├── CoursesPage.tsx         # Course browser ✅
    ├── CourseDetailPage.tsx    # Lesson list ✅
    ├── LessonPage.tsx          # Video + transcript ✅
    ├── QuizPage.tsx            # Quiz interface ✅
    └── TutorPage.tsx           # AI chat ✅
```

## Design Patterns

### 1. Consistent Layout
- All pages use white cards with `rounded-lg shadow-sm border border-gray-200`
- Consistent spacing: `space-y-8` for sections, `space-y-6` for page layout
- Max-width containers: `max-w-4xl` (quiz), `max-w-5xl` (tutor), `max-w-7xl` (layout)

### 2. Color Palette
- **Primary**: Indigo (indigo-600 buttons, indigo-100 highlights)
- **Success**: Green (green-50 bg, green-800 text, green-200 border)
- **Error**: Red (red-50 bg, red-800 text, red-200 border)
- **Info**: Blue (blue-50 bg, blue-900 text, blue-200 border)
- **Neutral**: Gray scale (50-900)

### 3. Typography
- **Headers**: `text-3xl` to `text-5xl`, `font-bold`
- **Body**: `text-base` (default), `text-gray-600` for secondary
- **Labels**: `text-sm font-medium text-gray-700`
- **Metadata**: `text-xs` or `text-sm text-gray-500`

### 4. Interactive Elements
- **Primary Buttons**: `bg-indigo-600 hover:bg-indigo-700 text-white`
- **Secondary Buttons**: `border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50`
- **Disabled**: `disabled:bg-gray-400 disabled:cursor-not-allowed`
- **Hover States**: Tailwind `hover:` utilities on all clickable elements

### 5. Responsive Breakpoints
- **Mobile First**: Base styles for mobile (< 640px)
- **Tablet**: `md:` prefix (768px+) for 2-column layouts
- **Desktop**: `lg:` prefix (1024px+) for 3-column layouts and sidebars
- **Extra Large**: `xl:` prefix (1280px+) for max-width adjustments

## Pending Work

### Phase 3.2: API Integration (Next Steps)

#### 1. Create API Utilities (`frontend/src/api/`)

**api/client.ts**: Axios instance
```typescript
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})
```

**api/ingest.ts**: Playlist endpoints
```typescript
export const ingestPlaylist = (url: string) => 
  apiClient.post('/api/v1/ingest/playlist', { url })

export const getPlaylist = (id: string) =>
  apiClient.get(`/api/v1/ingest/playlist/${id}`)
```

**api/transcribe.ts**: Transcription endpoints
**api/quiz.ts**: Quiz endpoints
**api/tutor.ts**: Tutor endpoints

#### 2. Create React Query Hooks (`frontend/src/hooks/`)

**hooks/usePlaylists.ts**: 
- `useIngestPlaylist()` - Mutation for POST /ingest/playlist
- `usePlaylist(id)` - Query for GET /ingest/playlist/:id

**hooks/useTranscripts.ts**:
- `useTranscript(videoId)` - Query for GET /transcribe/video/:id
- `useTranscribeVideo(videoId)` - Mutation for POST /transcribe/video/:id

**hooks/useQuiz.ts**:
- `useQuiz(videoId)` - Query for GET /quiz/video/:id
- `useSubmitAnswer(videoId, questionId)` - Mutation for POST /quiz/video/:id/question/:q_id/submit

**hooks/useTutor.ts**:
- `useAskQuestion()` - Mutation for POST /tutor/ask
- `useTutorHistory(sessionId)` - Query for GET /tutor/history/:sessionId
- `useClearHistory(sessionId)` - Mutation for DELETE /tutor/history/:sessionId

#### 3. Integrate Hooks into Pages

- Replace TODO comments with actual API calls
- Add loading skeletons (e.g., `react-loading-skeleton`)
- Add error boundaries and error messages
- Add retry logic for failed requests

#### 4. Create UI Components (`frontend/src/components/`)

**VideoPlayer.tsx**: YouTube iframe with controls
- Props: `videoId`, `onTimestampClick?`
- Ref forwarding for seek functionality

**TranscriptViewer.tsx**: Scrollable transcript with timestamp links
- Props: `segments: Array<{start: number, text: string}>`, `onSegmentClick: (time: number) => void`
- Auto-scroll to current segment based on video time

**QuizCard.tsx**: Single question with 4 options
- Props: `question`, `options`, `selectedAnswer`, `onSelectAnswer`, `showFeedback`, `correctAnswer`, `explanation`

**ChatMessage.tsx**: Message bubble with sources
- Props: `message: Message`, `onSourceClick?: (timestamp: string) => void`

**SourceCitation.tsx**: Clickable timestamp chip
- Props: `timestamp: string`, `text: string`, `onClick?: () => void`

**LoadingSpinner.tsx**: Indigo spinner
**ErrorMessage.tsx**: Red alert with retry button
**Toast.tsx**: Notification system (success/error/info)
**ProgressBar.tsx**: Progress indicator

### Phase 3.3: Polish & Testing

1. **Loading States**
   - Skeleton screens for data loading
   - Spinners for async operations
   - Disabled buttons during submission

2. **Error Handling**
   - Error boundaries for component crashes
   - API error messages with retry buttons
   - 404 pages for invalid routes
   - Offline detection

3. **Responsive Design**
   - Test on mobile (375px), tablet (768px), desktop (1280px)
   - Collapsible sidebar on mobile
   - Touch-friendly buttons (min 44x44px)
   - Font size adjustments

4. **Accessibility**
   - ARIA labels for interactive elements
   - Keyboard navigation support
   - Focus management
   - Screen reader testing

5. **Performance**
   - Code splitting with React.lazy()
   - Image optimization
   - Bundle size analysis
   - Lighthouse audit (target: 90+ scores)

6. **E2E Testing**
   - Playwright tests for critical flows
   - Test full workflow: ingest → transcribe → quiz → tutor
   - Test navigation between pages
   - Test API error scenarios

## Statistics

- **Files Created**: 7 (1 layout + 6 pages)
- **Lines of Code**: ~1,020 (TypeScript + JSX)
- **Routes Defined**: 7
- **API Endpoints Used**: 0 (all TODO)
- **Components Created**: 7 (all page-level)
- **Reusable Components Needed**: ~10 (VideoPlayer, QuizCard, etc.)

## Next Immediate Steps

1. **Create `frontend/src/api/` directory** with API client and endpoint functions
2. **Create `frontend/src/hooks/` directory** with React Query hooks
3. **Integrate hooks into CoursesPage** - Start with ingest playlist (simplest flow)
4. **Test full flow**: Add playlist → See it in list → Click → See lessons
5. **Move to LessonPage** - Video player + transcript (most complex, highest priority)
6. **Implement QuizPage** - Fetch quiz → Display questions → Submit answers
7. **Implement TutorPage** - Send questions → Display RAG responses
8. **Create reusable components** - Extract VideoPlayer, TranscriptViewer, etc.
9. **Add loading/error states** - Skeleton screens, error boundaries
10. **Test responsive design** - Mobile, tablet, desktop breakpoints

## Dependencies (Already Installed)

All dependencies are already listed in `frontend/package.json`:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.2",
    "react-query": "^3.39.3",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33"
  }
}
```

**No additional packages needed for Phase 3.2**.

## Timeline

- **Phase 3.1 (Current)**: Layout + Pages Scaffold - **COMPLETE** ✅
- **Phase 3.2**: API Integration - Estimated 2-3 hours
- **Phase 3.3**: Polish & Testing - Estimated 2-3 hours
- **Total Phase 3**: ~6-8 hours

## Related Files

- `PROJECT_STATUS.md` - Overall project progress (60% complete)
- `PHASE2.2_COMPLETE.md` - Backend AI Tutor (completed)
- `frontend/package.json` - Dependencies
- `frontend/vite.config.js` - Build configuration
- `backend/main.py` - API endpoint definitions
