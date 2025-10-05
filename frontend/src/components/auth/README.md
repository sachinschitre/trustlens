# Authentication System

This directory contains the authentication components for the TrustLens application.

## Components

### Login.jsx
- Role-based login form with client/freelancer selection
- Form validation and error handling
- Beautiful UI with animations
- Demo credentials for testing

### AuthContext.jsx
- Manages user authentication state
- Provides login/logout functionality
- Role-based access control helpers
- Persistent authentication using localStorage

## Features

### Role-Based Authentication
- **Client**: Can hire freelancers and manage projects
- **Freelancer**: Can find work and deliver projects

### User Experience
- Smooth animations and transitions
- Responsive design for all devices
- Dark/light mode support
- Persistent login state

### Security
- Form validation
- Role-based navigation
- Secure logout functionality

## Usage

### Demo Credentials
For testing purposes, you can use:
- **Email**: demo@trustlens.com
- **Password**: demo123
- **Role**: Choose either Client or Freelancer

### Integration
The authentication system is integrated throughout the application:
- App.jsx: Main authentication flow
- TopNavbar: User profile and logout
- Sidebar: Role-specific navigation
- Dashboards: Role-specific content

## Future Enhancements
- Real backend integration
- JWT token authentication
- Password reset functionality
- Two-factor authentication
- Social login options
