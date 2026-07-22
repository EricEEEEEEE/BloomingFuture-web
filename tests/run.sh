#!/usr/bin/env bash
set -u

python3 -m unittest discover -s tests -p 'test_*.py'
unit_code=$?
if [ "$unit_code" -ne 0 ]; then
  exit "$unit_code"
fi

python3 scripts/site_contract.py .
