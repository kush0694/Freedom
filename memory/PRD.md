# Freedom Score Platform - Product Requirements Document

## Executive Summary

Freedom Score is a **behavior-based financial health system** designed to measure financial stability and discipline over a 10+ year horizon. Unlike typical fintech apps that focus on wealth accumulation or trading, Freedom Score emphasizes **long-term financial resilience through consistent behavior**.

## Core Philosophy

### Non-Negotiable Principles

1. **Minimal Data Collection** - Only essential information
2. **Privacy Separation** - Identity and behavior data stored separately
3. **Behavior Over Numbers** - Decisions and consistency matter more than income
4. **Low Friction** - Monthly 60-second check-ins, no daily logging
5. **Ethical by Design** - No trading tips, no "get rich" messaging

## System Architecture

### Backend (FastAPI + MongoDB)

**Privacy-First Data Model:**
- `users` - Authentication only (email, password_hash)
- `identity_data` - Minimal PII (age_band, country, employment, income_band)
- `baseline_snapshot` - One-time financial context
- `monthly_checkins` - Recurring behavior inputs
- `behavioral_signals` - Continuous passive tracking
- `freedom_scores` - Score history with dimensional breakdown

### Frontend (Expo React Native)

**Navigation Structure:**
- Auth Flow: Login → Register
- Onboarding: Welcome → Identity → Baseline → Complete
- Main App (Tabs): Dashboard → Check-in → Profile

## Freedom Score Algorithm

### Score Range
**300 - 900** (similar to credit scores for familiarity)

### Five Dimensions

1. **Stability (30% weight)** - Income consistency
2. **Discipline (25% weight)** - Spending patterns
3. **Resilience (20% weight)** - Stress management
4. **Optionality (15% weight)** - Savings habits
5. **Time Horizon (10% weight)** - Long-term consistency

### Scoring Principles
- Missing data is NOT punished
- Consistent behavior improves score
- Panic behavior reduces score
- Slow movement (no sudden jumps)
- Monthly recalculation with daily micro-adjustments

## User Experience

### Monthly Check-in (60 seconds)

**4 Simple Questions:**
1. Income this month: Same / Higher / Lower
2. Spending discipline: On Track / Slightly Over / Way Over
3. Savings or investment done: Yes / No
4. Financial stress level: None / Minor / Heavy

### Dashboard Features
- **Freedom Score Display** - Large circular score (300-900)
- **Trend Indicator** - Up / Flat / Down with icon
- **Consistency Streak** - Months of consecutive check-ins
- **Dimensional Breakdown** - 5 progress bars showing each dimension
- **Score History Chart** - Line chart showing score over time
- **Monthly Insight** - One actionable suggestion per month

### Retention Mechanics (Subtle)
- Streaks for consistency (not money)
- "Still on track" confirmations
- Progress bars for stability, not returns
- No leaderboards
- No comparison with others

## Technical Implementation

### Backend Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user info

**Onboarding:**
- `POST /api/onboarding/identity` - Submit identity data
- `POST /api/onboarding/baseline` - Submit baseline snapshot
- `GET /api/onboarding/status` - Check completion status

**Check-in:**
- `POST /api/checkin/submit` - Submit monthly check-in
- `GET /api/checkin/latest` - Get last check-in
- `GET /api/checkin/can_submit` - Check eligibility

**Scoring:**
- `GET /api/score/current` - Current Freedom Score
- `GET /api/score/history` - Score history (last 12)

**Stats:**
- `GET /api/stats/streak` - Consistency streak

**Behavioral:**
- `POST /api/behavior/track` - Track behavioral signal
- `GET /api/behavior/signals` - Get signals

### Frontend Screens

**Auth:**
- Login - Fingerprint icon, email/password, "Welcome Back"
- Register - Person+ icon, email/password/confirm

**Onboarding:**
- Welcome - Philosophy explanation with 4 principle cards
- Identity - Tap-based selection for demographics
- Baseline - Financial snapshot with yes/no toggles
- Complete - Success screen with notification scheduling

**Main App:**
- Dashboard - Score display, dimensions, chart, streak, insights
- Check-in - 4 questions with icon-based tap selection
- Profile - About, settings, privacy info, logout

### Security & Privacy

- JWT authentication with 7-day expiration
- bcrypt password hashing
- Separate database collections for PII vs behavior
- No raw transaction storage
- No merchant-level data
- Clear data deletion policies

### Push Notifications

- Monthly reminder on 1st of each month (10:00 AM)
- Permission requested during onboarding
- iOS & Android support via Expo Notifications

## Testing Results

### Backend (All Passing ✓)
- JWT Authentication: Registration, login, token validation
- Onboarding: Identity + baseline submission, initial score calculation
- Score Engine: Correct calculation (520 base → 876 after positive check-in)
- Check-in: Monthly submission, duplicate prevention, score recalculation
- History & Stats: Score history retrieval, streak calculation

### Frontend (UI Working ✓)
- Login/Register screens rendering correctly
- Navigation structure functional
- All screens designed with mobile-first approach
- Proper icon usage (no emojis)
- Tap-friendly buttons (44px+ touch targets)

## Future Enhancements (Not in MVP)

1. **Passive Behavioral Tracking**
   - Rule overrides
   - Automation failures
   - Goal pauses
   - Panic actions

2. **Advanced Analytics**
   - Predictive insights
   - Personalized recommendations
   - Trend analysis

3. **Social Features** (Optional)
   - Anonymous community support
   - No leaderboards or comparisons

4. **Monetization** (Post-Launch)
   - Individual subscriptions
   - B2B employee programs
   - Institutional licensing
   - No ads, no data selling

## Success Metrics

### Short-term (3 months)
- User completes onboarding
- At least 1 check-in submitted
- Score changes reflect behavior

### Medium-term (1 year)
- 80%+ monthly check-in completion rate
- Consistent score improvement for disciplined users
- Low churn rate

### Long-term (5+ years)
- Platform still operational and trusted
- User base growing organically
- No ethical controversies or data breaches

## Deployment Considerations

### Environment Variables
- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET_KEY` - Secret for token signing
- `DB_NAME` - Database name
- `EXPO_PUBLIC_BACKEND_URL` - API URL for mobile app

### Infrastructure
- Backend: FastAPI on port 8001
- Frontend: Expo with tunnel preview
- Database: MongoDB with proper indexing
- HTTPS required for production

## Conclusion

Freedom Score is built for **durability, not virality**. It's a boring, defensible, trust-first financial platform designed to help millions achieve financial stability over decades, not quick wealth overnight.

**Optimize for the long game.**
