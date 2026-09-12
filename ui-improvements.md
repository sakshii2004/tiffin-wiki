Issues observed on mobile UI:
- The "Where do you need food?" search bar is exceeding the width of the screen. 
- There is no "Login" button on the navbar.
- The search bar that appears in the navbar when we're on a /tiffin/ page,  it is exceeding the navbar (that is correctly adjusted in the width of the screen)
- On a tiffin listing page, the "REviews" card is immediately followed by "Know another great tiffin service?", which is fine but they are showing up in the middle of Service details card and Photos. These two cards must come at the end. 
- I can't expand the images in Photos section of a tiffin listing page. 
- The tiffin listing page randomly reloads every few seconds. Observed on mobile (not sure about web but it could be a collective problem as well)
- None of the filters work on the search page on mobile
- Non UI issue: I am not able login via mobile:
GET /login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Ftiffin%2Flilavatis-tiffin-pune-ea72%2Freview 200 in 110ms (next.js: 9ms, application-code: 102ms)
⚠ Blocked cross-origin request to Next.js dev resource /__nextjs_font/geist-latin.woff2 from "192.168.1.6".
Cross-origin access to Next.js dev resources is blocked by default for safety.

To allow this host in development, add it to "allowedDevOrigins" in next.config.js and restart the dev To allow this host in development, add it to "allowedDevOrigins" in next.config.js and restart the dev r:

// next.config.js
module.exports = {
  allowedDevOrigins: ['192.168.1.6'],
}

Instead of specifically solving for these, I'd like you to do an overall mobile UI sweep because it is very important this product remains user friendly and pretty on mobile without disturbing the current desktop UI at all.

