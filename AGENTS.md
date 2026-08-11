# FilmBase engineering guide

FilmBase is a movie-first catalogue for African and international movies, series, and anime. Preserve its editorial-cinema identity: quiet typography, poster-led colour, useful metadata, and fast low-bandwidth browsing. Do not introduce generic gradient heroes, glass cards, decorative glow, or copy that could belong to any streaming product.

## Architecture

- UI components consume normalized domain models. Provider-specific fields stay in `lib/` adapters.
- Keep legacy FilmBase URLs working when routes or provider identities change.
- Treat download sources as explicit offers. Never disguise external hosts or advertisements as download actions.
- Browser code must not call upstream providers directly when a server-side adapter or route is available.

## UI quality floor

- Support light and dark themes, keyboard navigation, visible focus, reduced motion, and mobile layouts down to 360px.
- Use two poster columns on phones unless the compact list view is selected.
- Render clearly labeled ads only when a real ad unit is present. Empty ad slots must collapse completely; loaded ads should use bounded responsive dimensions to avoid layout shifts.
- Check empty, loading, error, long-title, missing-image, and slow-network states.

## Verification

Run these before handing off relevant changes:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

For UI work, start the app and use Chrome DevTools MCP to inspect 360px, 768px, and 1440px layouts in both themes. Check the console and network panel, then capture screenshots for visual review.
