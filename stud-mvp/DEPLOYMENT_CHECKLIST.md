# 🚢 Production Deployment Checklist

Use this checklist before deploying STUD MVP to production.

---

## 🔐 Security Configuration

### Environment Variables
- [ ] Change `SECRET_KEY` to a strong random value
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure `CORS_ORIGINS` with production domain(s)
- [ ] Verify `OPENAI_API_KEY` is valid and has credits
- [ ] Verify `YOUTUBE_API_KEY` is valid with correct quota
- [ ] Remove any `.env` files from version control
- [ ] Ensure all `.env.example` files have no real secrets

### Authentication & Authorization
- [ ] Test user registration flow end-to-end
- [ ] Test login flow with correct credentials
- [ ] Test login flow with incorrect credentials (should fail gracefully)
- [ ] Test protected routes without authentication (should redirect)
- [ ] Test protected routes with invalid token (should reject)
- [ ] Test JWT token expiration (should require re-login)
- [ ] Test password hashing (verify passwords are never stored in plain text)
- [ ] Test account deletion flow (GDPR compliance)

### API Security
- [ ] Enable HTTPS/SSL (Let's Encrypt or cloud provider SSL)
- [ ] Verify CORS is configured correctly (not `*` in production)
- [ ] Test rate limiting (if implemented)
- [ ] Review API endpoints for proper authentication
- [ ] Check for SQL injection vulnerabilities (SQLAlchemy should handle this)
- [ ] Verify no sensitive data in error messages
- [ ] Test file upload limits (if applicable)

---

## 💾 Database Configuration

### Database Setup
- [ ] Migrate from SQLite to PostgreSQL for production
  ```env
  DATABASE_URL=postgresql://user:password@host:5432/stud_prod
  ```
- [ ] Run database migrations
  ```bash
  python -c "from app.core.database import init_db; init_db()"
  ```
- [ ] Verify database connection
- [ ] Set up database backups (daily recommended)
- [ ] Configure connection pooling (SQLAlchemy handles this)
- [ ] Test database failover (if using replicas)

### Data Management
- [ ] Set up automated backups
  - Daily full backups
  - Hourly incremental backups (optional)
- [ ] Test backup restoration
- [ ] Configure backup retention policy (30 days recommended)
- [ ] Document database restoration procedure
- [ ] Set up monitoring for database disk usage

---

## 🏗️ Infrastructure Setup

### Docker Configuration
- [ ] Build production Docker images
  ```bash
  docker-compose -f docker-compose.prod.yml build
  ```
- [ ] Test Docker containers in production mode
- [ ] Verify health checks are working
  ```bash
  curl http://localhost:8000/health
  ```
- [ ] Configure container restart policies (`restart: unless-stopped`)
- [ ] Set resource limits for containers (CPU, memory)
- [ ] Test container orchestration (if using Kubernetes)

### Networking & DNS
- [ ] Configure custom domain (e.g., stud.yourdomain.com)
- [ ] Set up DNS A/AAAA records
- [ ] Configure CDN (Cloudflare, CloudFront) for static assets
- [ ] Enable DDoS protection
- [ ] Set up reverse proxy (Nginx) with proper headers
- [ ] Configure SSL/TLS certificates
- [ ] Test HTTPS redirects

### Server Configuration
- [ ] Set up firewall rules (allow only 80, 443, 22)
- [ ] Configure SSH key-based authentication
- [ ] Disable root SSH login
- [ ] Set up fail2ban for brute force protection
- [ ] Configure automatic security updates
- [ ] Set up log rotation
- [ ] Configure timezone to UTC

---

## 📊 Monitoring & Logging

### Error Tracking
- [ ] Configure Sentry DSN
  ```env
  SENTRY_DSN=https://...your-sentry-dsn...
  ```
- [ ] Test Sentry error reporting
  ```python
  # In Python: raise Exception("Test error")
  # Verify error appears in Sentry dashboard
  ```
- [ ] Set up Sentry alerts for critical errors
- [ ] Configure Sentry release tracking
- [ ] Set up Sentry performance monitoring

### Application Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure health check endpoint monitoring
- [ ] Set up API endpoint monitoring
- [ ] Monitor response times (p50, p95, p99)
- [ ] Set up alerts for high error rates
- [ ] Monitor database query performance

### Logging
- [ ] Configure centralized logging (Papertrail, Loggly)
- [ ] Set appropriate log levels (`INFO` in production)
- [ ] Ensure no sensitive data in logs (passwords, API keys)
- [ ] Set up log retention policy (30-90 days)
- [ ] Configure log aggregation and search
- [ ] Test log forwarding to monitoring service

### Performance Monitoring
- [ ] Set up application performance monitoring (APM)
- [ ] Monitor CPU usage
- [ ] Monitor memory usage
- [ ] Monitor disk usage
- [ ] Set up alerts for resource thresholds
- [ ] Configure auto-scaling (if on cloud platform)

---

## 🧪 Testing & Validation

### Automated Testing
- [ ] Run full backend test suite
  ```bash
  cd backend && pytest tests/ -v --cov=app
  ```
- [ ] Verify 80%+ test coverage
- [ ] Run frontend E2E tests
  ```bash
  cd frontend && npm run test:e2e
  ```
- [ ] Run linting checks
  ```bash
  cd backend && black . && isort .
  cd frontend && npm run lint
  ```
- [ ] Test production builds locally
  ```bash
  docker-compose -f docker-compose.prod.yml up
  ```

### Manual Testing
- [ ] Test complete user registration flow
- [ ] Test login and logout
- [ ] Test YouTube playlist import (full workflow)
- [ ] Test video transcription
- [ ] Test quiz generation and taking
- [ ] Test AI tutor Q&A
- [ ] Test all protected routes
- [ ] Test error handling (network errors, API failures)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test accessibility (keyboard navigation, screen readers)

### Load Testing
- [ ] Run load tests with k6 or Artillery
- [ ] Test concurrent user capacity
- [ ] Test API rate limiting
- [ ] Test database connection limits
- [ ] Test file upload limits
- [ ] Document performance baselines

---

## 🚀 Deployment Process

### Pre-Deployment
- [ ] Review all code changes
- [ ] Update version number in `package.json` and `main.py`
- [ ] Create git tag for release
  ```bash
  git tag -a v1.0.0 -m "Release v1.0.0"
  git push origin v1.0.0
  ```
- [ ] Update CHANGELOG.md
- [ ] Notify team of deployment window

### Deployment Steps
- [ ] Create database backup before deployment
- [ ] Deploy backend service
  ```bash
  git pull origin main
  docker-compose -f docker-compose.prod.yml up -d --build backend
  ```
- [ ] Verify backend health check
  ```bash
  curl https://api.yourdomain.com/health
  ```
- [ ] Deploy frontend service
  ```bash
  docker-compose -f docker-compose.prod.yml up -d --build frontend
  ```
- [ ] Verify frontend loads correctly
- [ ] Test critical user paths (login, import, quiz, tutor)

### Post-Deployment
- [ ] Monitor error rates in Sentry (first 30 minutes)
- [ ] Check application logs for errors
- [ ] Test authentication flow on production
- [ ] Test API endpoints on production
- [ ] Verify database connections are stable
- [ ] Monitor CPU and memory usage
- [ ] Send deployment notification to team
- [ ] Update status page (if applicable)

### Rollback Plan
- [ ] Document rollback procedure
  ```bash
  git checkout <previous-commit>
  docker-compose -f docker-compose.prod.yml up -d --build
  ```
- [ ] Test rollback in staging environment
- [ ] Keep previous Docker images for quick rollback
- [ ] Document database migration rollback (if schema changed)

---

## 📝 Documentation & Communication

### Documentation
- [ ] Update README.md with production URLs
- [ ] Document environment variables in .env.example
- [ ] Update API documentation (if endpoints changed)
- [ ] Document deployment procedure
- [ ] Create incident response playbook
- [ ] Document backup/restore procedure

### Team Communication
- [ ] Notify team of deployment schedule
- [ ] Share production URLs and credentials (securely)
- [ ] Document on-call rotation
- [ ] Set up incident response channels (Slack, PagerDuty)
- [ ] Create runbook for common issues

---

## 🎯 Go-Live Checklist

### Final Checks Before Launch
- [ ] All tests passing (backend + frontend + E2E)
- [ ] All security configurations reviewed
- [ ] SSL/HTTPS working correctly
- [ ] Database backups configured and tested
- [ ] Monitoring and alerting active
- [ ] Error tracking (Sentry) working
- [ ] CDN configured for static assets
- [ ] Custom domain configured correctly
- [ ] Email notifications working (if applicable)
- [ ] Terms of Service and Privacy Policy accessible
- [ ] Support email/contact form working
- [ ] Performance baselines documented

### Launch Day
- [ ] Deploy to production during low-traffic window
- [ ] Monitor for first 2 hours continuously
- [ ] Test critical flows manually
- [ ] Have rollback plan ready
- [ ] Team on standby for issues
- [ ] Celebrate! 🎉

---

## 🔄 Post-Launch

### First Week
- [ ] Monitor error rates daily
- [ ] Review user feedback
- [ ] Check performance metrics
- [ ] Adjust rate limits if needed
- [ ] Optimize slow queries
- [ ] Fix critical bugs immediately

### Ongoing Maintenance
- [ ] Weekly security updates
- [ ] Monthly dependency updates
- [ ] Quarterly load testing
- [ ] Regular backup testing
- [ ] User feedback review
- [ ] Performance optimization

---

## 📞 Emergency Contacts

Document these before going live:

- **On-Call Engineer**: [Name] [Phone] [Email]
- **Database Admin**: [Name] [Phone] [Email]
- **DevOps Lead**: [Name] [Phone] [Email]
- **Product Owner**: [Name] [Phone] [Email]
- **Hosting Provider Support**: [URL] [Phone]
- **Sentry Dashboard**: https://sentry.io/organizations/[org]/issues/
- **Monitoring Dashboard**: [URL]
- **Server Access**: [SSH command] or [Cloud console URL]

---

## ✅ Deployment Complete!

Once all items are checked:
- [ ] Mark deployment as successful in team chat
- [ ] Update status page to "Operational"
- [ ] Monitor for 24 hours
- [ ] Collect initial user feedback
- [ ] Plan next iteration

---

**Last Updated**: November 10, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
