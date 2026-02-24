# Workflow Import Compatibility Notes

## Background
- Historical workflow JSON files may omit `steps[i].parameters` or set it to `null`.
- Previous strict validation rejected these files during import.

## Current Behavior
- Validation now accepts:
  - missing `steps[i].parameters`
  - `steps[i].parameters = null`
- During normalization, non-object `parameters` are converted to `{}`.

## Compatibility Scope
- This change is import-time normalization only.
- Runtime workflow shape remains unchanged (`parameters` is always treated as an object after normalization).
- Invalid non-object values (for example string/number/array) are still rejected.
