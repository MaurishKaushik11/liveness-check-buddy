# Face Liveness Detection System

## Overview

This is a real-time face liveness detection application built with React and TypeScript. The system uses computer vision techniques including MediaPipe Face Mesh to detect facial landmarks, analyze blink patterns, and estimate head pose for biometric authentication. The application provides a comprehensive security solution to distinguish between live users and spoofing attempts through advanced facial analysis algorithms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application follows a modern React architecture with TypeScript, utilizing:
- **Component-based structure**: Organized into reusable UI components using shadcn/ui design system
- **State management**: React hooks for local state management with prop drilling for data flow
- **Routing**: React Router for client-side navigation with catch-all 404 handling
- **Styling**: Tailwind CSS with a custom dark theme design system featuring tech-inspired gradients and colors

### Computer Vision Pipeline
The core detection system is built around:
- **MediaPipe Face Mesh**: Primary facial landmark detection engine processing 468+ facial points
- **Real-time analysis**: Camera component handles video stream processing and landmark extraction
- **Blink detection**: Eye Aspect Ratio (EAR) calculation using specific eye landmark coordinates
- **Head pose estimation**: 3D orientation analysis using nose tip and eye corner positions
- **Liveness scoring**: Combination of blink frequency, head movement, and facial landmark consistency

### Component Architecture
- **Camera Component**: Manages video capture, MediaPipe integration, and real-time landmark processing
- **LivenessStatus Component**: Processes facial data, tracks blink history, and determines liveness scores
- **UI Components**: Comprehensive shadcn/ui component library for consistent design patterns

### Development Setup
- **Build System**: Vite for fast development and optimized production builds
- **Code Quality**: ESLint configuration with React-specific rules and TypeScript support
- **Path Aliases**: Configured for clean imports using @ prefix for src directory

## External Dependencies

### Computer Vision Libraries
- **@mediapipe/face_mesh**: Google's MediaPipe Face Mesh model for facial landmark detection
- **@mediapipe/camera_utils**: MediaPipe camera utilities for video stream handling

### UI Framework Dependencies
- **React 18**: Core frontend framework with modern hooks and concurrent features
- **@radix-ui/***: Comprehensive set of accessible UI primitives for components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Modern icon library for consistent iconography

### Development Tools
- **TypeScript**: Type safety and enhanced developer experience
- **Vite**: Fast build tool and development server
- **TanStack Query**: Data fetching and caching library for API interactions

### Additional Libraries
- **React Hook Form**: Form handling with validation support
- **Class Variance Authority**: Type-safe component variant management
- **Next Themes**: Theme switching capabilities for dark/light mode support