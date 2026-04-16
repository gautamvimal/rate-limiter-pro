#!/usr/bin/env bash
set -e

API_BASE_URL=${1:-http://localhost:5000}

echo "Triggering SLA tuning at ${API_BASE_URL}/admin/policies/sync-sla"
curl -X POST "${API_BASE_URL}/admin/policies/sync-sla" \
  -H 'Content-Type: application/json'
