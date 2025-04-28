# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Ruby Tests
- Run all Ruby tests: `rails test`
- Run a specific test file: `rails test test/path/to/test_file.rb`
- Run a specific test method: `rails test test/path/to/test_file.rb:line_number`
- Run system tests: `rails test:system`

### JavaScript
- Lint JavaScript: `yarn lint`
- Run JavaScript tests: `yarn test`
- Run a specific JS test: `yarn test path/to/test.js`

## Style Guidelines

### Ruby
- Follow RuboCop rules (see .rubocop.yml)
- Line length max: 120 characters
- Use 2 spaces for indentation

### JavaScript/React
- SingleQuotes over DoubleQuotes
- No semicolons at line ends
- 2 spaces for indentation
- Prettier config: printWidth 90, singleQuote true
- React components should use functional style

### Naming Conventions
- Ruby: snake_case for methods/variables, CamelCase for classes
- JavaScript: camelCase for variables/functions, PascalCase for components