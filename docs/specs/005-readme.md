# 005 README

## Goal

Rewrite README.md to present the project clearly for employers.

## Context

The current README covers setup and environment but lacks a summary, motivation, links to related repos, and a description of how I work on the project. It also uses the old name "HomeApp" instead of "home-server.app".

## Scope

Rewrite README.md with these sections in order:

1. **Title and one sentence summary** with CI badge at the top
2. **Why I built it** — Started as irrigation control, expanded to a personal multi-tool so I could have things customized the way I want without juggling multiple apps. Also wanted more React Native experience.
3. **How it fits** — Link related repos (home-server.api, home-server.web, homewebsocket.api)
4. **Stack** — React Native 0.77, React 18, TypeScript, React Navigation 7, Axios, React Native Paper, Jest
5. **Running it locally** — Prerequisites, install steps, dev and release build commands
6. **Configuration** — Table of environment variables from .env.example
7. **Tests** — How to run tests, what's covered
8. **How I work on it** — Two or three sentences about the spec loop

## Out of scope

- Screenshots (none available)
- Architecture or Components sections (this is not the main project repo)

## Acceptance criteria

- README.md follows the section order above
- CI badge links to the correct GitHub Actions workflow
- All related repos are linked with their GitHub URLs
- Environment variable table matches .env.example
- No real IPs, domains, or secrets
- Writing follows the cleanup.txt rules (plain first person, no dashes as punctuation, no semicolons, no colons in prose, no filler words, no emoji)

## Test plan

- Read the final README and verify all sections are present and accurate
- Verify badge URL resolves correctly
- Verify no real IPs or domains leaked

## Notes

Related repo GitHub URLs to link:
- home-server.api: https://github.com/Buie-Dev/home-server.api
- home-server.web: https://github.com/Buie-Dev/home-server.web
- homewebsocket.api: https://github.com/Buie-Dev/homewebsocket.api
