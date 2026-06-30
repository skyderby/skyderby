# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Skyderby is a web application that provides gps tracks analysys, online ranknig and competition scoring
for skydivers and base jumpers.

## Style Guidelines
- You must not write comments in the code unless explicitly requested

### Ruby
- Verify code style with Rubocop and run corresponding test if it exists
- Prefer using fixtures and manually creating records instead of factories
- Do not create service objects unless explicitly requested, either use a model method, concern or place the code in the controller
- Check with rubocop for style issues
- Prefer RESTful/resourceful routes (standard CRUD actions on a resource) over custom member/collection actions. For sub-features, use a nested resource with its own controller (e.g. `Tracks::ChartSettingsController#update`) instead of adding a custom action to the parent controller.
- Avoid passing 3+ instance variables to a view; bundle them into a namespaced PORO wrapper in `app/models/<owner>/` (e.g. `Profiles::Dashboard`, `Profiles::SubscriptionAdmin`), usually a `SimpleDelegator` around the main record, and assign one ivar. Expose the data through memoized reader methods instead of computing it in the controller.

### Frontend
- For new styles use CSS, if you need to touch SCSS - rewrite it to CSS
- Use shared styles as if you are creating a design system instead of writing page specific styles.
  Write utility styles.
- Use what Hotwire offers - Stimulus, Turbo Streams and Turbo Frames
- Pass urls as data-attribute using route helpers, do not hardcode urls in JS
- Verify JS code style with `yarn lint`, if there is corresponding test to file - run test too

### Translations
- Application is translated to English, Russian, German, Italian, Spanish, French
- All strings in UI should be placed in config/locales yml files
  - Model translations should be in `config/locales/models/<model>.<locale>.yml`. No subfolders. 
  - View translations should be in `config/locales/<subsystem>.<locale>.yml`. Flat structure.
  - Use `general.<locale>.yml` for translations that are not specific to a model or subsystem, like cancel, delete, save, confirm, etc.
