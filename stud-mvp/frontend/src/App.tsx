import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider } from './contexts/AuthContext'

// Layout
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LessonPage from './pages/LessonPage'
import QuizPage from './pages/QuizPage'
import TutorPage from './pages/TutorPage'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route 
                path="courses" 
                element={
                  <ProtectedRoute>
                    <CoursesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="courses/:playlistId" 
                element={
                  <ProtectedRoute>
                    <CourseDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="courses/:playlistId/lessons/:videoId" 
                element={
                  <ProtectedRoute>
                    <LessonPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="quiz/:videoId" 
                element={
                  <ProtectedRoute>
                    <QuizPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="tutor" 
                element={
                  <ProtectedRoute>
                    <TutorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="tutor/:sessionId" 
                element={
                  <ProtectedRoute>
                    <TutorPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
