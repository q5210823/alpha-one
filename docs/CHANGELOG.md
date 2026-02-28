# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.

## [Unreleased]

### Added
- Placeholder for upcoming features.

### Changed
- Placeholder for upcoming changes.

### Fixed
- Placeholder for upcoming fixes.

## [1.0.0] - 2026-02-28

### Added
- MV3 Chrome extension scaffold with new tab override.
- Real-time earning calculation based on monthly net income.
- Work duration calculation with lunch break exclusion.
- Settings dialog in new tab and standalone options page.
- Daily progress bar based on work start/end time.
- Configurable work-end time.
- Local documentation:
  - PRD (`docs/PRD.md`)
  - Technical spec (`docs/TECH_SPEC.md`)

### Changed
- Default settings updated:
  - `workHoursPerDay`: 8
  - `workStart`: 09:00
  - `lunchStart`: 12:00
  - `lunchEnd`: 13:30
  - `workEnd`: 18:00

### Fixed
- Removed deprecated motivation-threshold setting from UI and logic.

## Versioning Notes
- Recommended strategy: `major.minor.patch`
- Example:
  - `1.0.1`: bug fix only
  - `1.1.0`: backward-compatible feature
  - `2.0.0`: breaking change
