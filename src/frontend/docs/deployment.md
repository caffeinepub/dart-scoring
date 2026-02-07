# Deployment Guide

This guide covers deploying the Dart Scoring application on the Internet Computer (IC) platform for both local development and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Health Check Verification](#health-check-verification)
- [Configuration](#configuration)
- [Reverse Proxy (Optional)](#reverse-proxy-optional)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have the following installed:

- **dfx** (DFINITY Canister SDK) version 0.15.0 or later
  - Install: `sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"`
- **Node.js** version 18 or later
- **pnpm** package manager
  - Install: `npm install -g pnpm`

## Local Development

### 1. Initial Setup

Clone the repository and install dependencies:

