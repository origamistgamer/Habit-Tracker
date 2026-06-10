# Specification — Streakr

**Project Name:** Streakr Habit Tracker  
**Date:** 2026-06-10

## 1. Executive Summary

A browser-based habit tracker that helps users build streaks with a beautiful dark UI, offline PWA support, and local-only data storage.

## 2. Problem Statement

Habit apps often require accounts, subscriptions, or constant connectivity. Users need a simple, private tracker that works offline.

## 3. Scope & Audience

- **Users:** Individuals tracking daily/weekly habits.
- **Platform:** Web browser, mobile-responsive, installable PWA.
- **Language:** English UI.

## 4. Functional Requirements

1. Users can add, edit, delete, and reorder habits (emoji, color, name, weekly frequency).
2. Users can mark habits complete on Today view and toggle any day on Calendar.
3. Streaks and stats (heatmaps, percentages) update from completion logs.
4. Users can export and import JSON backups.
5. App works offline after first load (service worker + localStorage).

## 5. Non-Functional Requirements

- No backend required for core features.
- AGPL-3.0 licensed, Swecha compliance configs present.
- Vanilla JS only — no Python or Node build chain.
