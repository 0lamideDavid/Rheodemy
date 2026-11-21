#!/usr/bin/env bash
# Export environment variables for Vercel deployment of Rheodemy Frontend
# Replace placeholder values with your actual secrets before running.

export DATABASE_URL="<YOUR_DATABASE_URL>"
# Backend API endpoint (adjust if using a custom host)
export NEXT_PUBLIC_API_URL="https://api.rheodemy.com"

# API keys for LLM services (if used by the backend or front‑end)
export GEMINI_API_KEY="<YOUR_GEMINI_API_KEY>"
export OPENAI_API_KEY="<YOUR_OPENAI_API_KEY>"
export ANTHROPIC_API_KEY="<YOUR_ANTHROPIC_API_KEY>"

# Optional analytics / telemetry keys
# export VERCEL_ANALYTICS_ID="<YOUR_VERCEL_ANALYTICS_ID>"

# Add any additional env vars required by your backend here.

echo "Environment variables exported."

