# FilmBase Android

Native FilmBase Android client. It renders Android views and fetches catalogue data directly from both FilmBase APIs—API2 for normalized home/search/title/offers and the legacy FilmBase API for regional collections. It does not load `filmbase.fun` in a WebView.

Resolved files are handed directly to Android's Download Manager. Provider identities are discarded at the app model/UI boundary.

Version 3 uses Jetpack Compose and ports FilmBase's website identity into native screens: transmission rail, mixed poster wall, FilmBase counter, editorial shelves, title files, a dedicated Download Desk, and a persistent Saved/Recent/Downloads library.

Build with `./gradlew assembleDebug` once Android SDK 35 is available.
