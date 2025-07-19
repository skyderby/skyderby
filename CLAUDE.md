# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Ruby Tests
- Run all Ruby tests: `bin/rails test`
- Run a specific test file: `bin/rails test test/path/to/test_file.rb`
- Run a specific test method: `bin/rails test test/path/to/test_file.rb:line_number`
- Run system tests: `bin/rails test:system`

### JavaScript
- Lint JavaScript: `yarn lint`
- Run JavaScript tests: `yarn test`
- Run a specific JS test: `yarn test path/to/test.js`

## Style Guidelines

- You must not write comments in the code unless explicitly requested
- 2 spaces for indentation

### Ruby
- Line length 120 characters

### JavaScript
- SingleQuotes over DoubleQuotes


### CSS
- Prefer CSS over SCSS

### Translations
- Model translations should be in `config/locales/models/<model>.<locale>.yml`. No subfolders. 
- View translations should be in `config/locales/<subsystem>.<locale>.yml`. Flat structure.
- Use `general.<locale>.yml` for translations that are not specific to a model or subsystem, like cancel, delete, save, confirm, etc.
