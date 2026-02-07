# Game Snapshot Contract

This document defines the canonical **Game Snapshot** contract used throughout the Dart Scoring application for multi-device rendering and realtime synchronization.

## Overview

The Game Snapshot is the single source of truth for game state. It is:

- **Returned by backend methods** (e.g., game creation, score submission)
- **Broadcast via realtime events** in the envelope `{ type: "GAME_SNAPSHOT", payload: <snapshot> }`
- **Consumed by frontend UI** to render scoreboard, turns, and game status without additional requests

## Snapshot Structure

The snapshot has four top-level keys:

