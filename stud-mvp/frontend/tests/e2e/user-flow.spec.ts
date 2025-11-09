import { test, expect } from '@playwright/test';

test.describe('STUD MVP - Complete User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should register new user and access protected routes', async ({ page }) => {
    // Go to register page
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/register');

    // Fill registration form
    const timestamp = Date.now();
    await page.fill('input[name="username"]', `testuser_${timestamp}`);
    await page.fill('input[name="email"]', `test_${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to courses page after registration
    await expect(page).toHaveURL('/courses');
    
    // Should show username in header
    await expect(page.locator(`text=testuser_${timestamp}`)).toBeVisible();
  });

  test('should login existing user', async ({ page }) => {
    // First register a user
    await page.goto('/register');
    const timestamp = Date.now();
    await page.fill('input[name="username"]', `testuser_${timestamp}`);
    await page.fill('input[name="email"]', `test_${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123');
    await page.click('button[type="submit"]');

    // Logout
    await page.click('text=Logout');
    await expect(page).toHaveURL('/login');

    // Login again
    await page.fill('input[name="username"]', `testuser_${timestamp}`);
    await page.fill('input[name="password"]', 'TestPassword123');
    await page.click('button[type="submit"]');

    // Should be logged in
    await expect(page).toHaveURL('/courses');
    await expect(page.locator(`text=testuser_${timestamp}`)).toBeVisible();
  });

  test('complete learning flow: import → watch → quiz → tutor', async ({ page }) => {
    // Register and login
    await page.goto('/register');
    const timestamp = Date.now();
    await page.fill('input[name="username"]', `testuser_${timestamp}`);
    await page.fill('input[name="email"]', `test_${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123');
    await page.click('button[type="submit"]');

    // Should be on courses page
    await expect(page).toHaveURL('/courses');

    // Import a playlist
    await page.fill('input[placeholder*="YouTube playlist URL"]', 
      'https://www.youtube.com/playlist?list=PLZlA0Gpn_vH9lupx0Zw6NM91lQdQjzYTx');
    await page.click('button:has-text("Import")');

    // Wait for import to complete
    await expect(page.locator('text=Playlist imported successfully')).toBeVisible({ timeout: 10000 });

    // Click on the imported course
    await page.click('.course-card'); // Adjust selector based on actual implementation

    // Should be on course detail page
    await expect(page.url()).toContain('/courses/');

    // Click on first lesson
    await page.click('.lesson-card:first-child'); // Adjust selector

    // Should be on lesson page with video and transcript
    await expect(page.locator('iframe')).toBeVisible(); // YouTube embed
    
    // Wait for transcription (may take time)
    await page.click('button:has-text("Transcribe")');
    await expect(page.locator('text=Transcription complete')).toBeVisible({ timeout: 120000 });

    // Click on quiz
    await page.click('a:has-text("Take Quiz")');
    
    // Should be on quiz page
    await expect(page.url()).toContain('/quiz/');
    
    // Generate quiz
    await page.click('button:has-text("Generate Quiz")');
    await expect(page.locator('.quiz-question')).toBeVisible({ timeout: 30000 });

    // Answer a question
    await page.click('.quiz-option:first-child'); // Select first option
    await page.click('button:has-text("Submit Answer")');
    
    // Should see feedback
    await expect(page.locator('.quiz-feedback')).toBeVisible();

    // Go to AI Tutor
    await page.click('a:has-text("AI Tutor")');
    await expect(page).toHaveURL('/tutor');

    // Ask a question
    await page.fill('textarea[placeholder*="question"]', 'What is the main topic of this video?');
    await page.click('button:has-text("Send")');

    // Should see AI response
    await expect(page.locator('.chat-message.assistant')).toBeVisible({ timeout: 10000 });
  });

  test('should protect routes when not authenticated', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('/courses');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should handle login errors gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Try to login with invalid credentials
    await page.fill('input[name="username"]', 'nonexistent');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Incorrect username or password')).toBeVisible();
  });

  test('should navigate using header navigation', async ({ page }) => {
    // Register and login
    await page.goto('/register');
    const timestamp = Date.now();
    await page.fill('input[name="username"]', `testuser_${timestamp}`);
    await page.fill('input[name="email"]', `test_${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123');
    await page.click('button[type="submit"]');

    // Click on Home link
    await page.click('a:has-text("Home")');
    await expect(page).toHaveURL('/');

    // Click on AI Tutor link
    await page.click('a:has-text("AI Tutor")');
    await expect(page).toHaveURL('/tutor');

    // Click on Courses link
    await page.click('a:has-text("Courses")');
    await expect(page).toHaveURL('/courses');
  });
});
