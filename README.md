# Babycakes RSVP

Mobile-first wedding RSVP website for Babycakes, Caluya Island, Antique — May 2028.

## Current phase

**PRELIM RSVP**

This first RSVP is for estimating the number of guests joining the wedding week in Caluya. The same site can later switch to a **FINAL RSVP** with more complete travel, accommodation, guest, and event details.

## Files

- `index.html` — page structure and wedding content
- `css/style.css` — cinematic mobile-first visual system
- `js/app.js` — navigation, scroll reveals, and RSVP interaction
- `data/content.js` — phase/content configuration
- `assets/` — reserved for real prenup photos, video, fonts, and icons

## Current behavior

The preliminary RSVP currently saves the response to the visitor's browser with `localStorage`. It is intentionally **not yet a live guest database**.

Before public launch, the RSVP form should be connected to a protected free/low-cost backend or form endpoint so responses can be collected centrally.

## Included wedding-week content

- Beach wedding
- Sunset timing
- White carpet
- Caluya Festival
- Tatusan Festival
- Current identified accommodation capacity: 215 pax
- Current accommodation list
- Preliminary souvenir list
- Placeholder area for future prenup photos/video

## Design direction

Cinematic, editorial, scroll-based, mobile-first, and app-like. Real prenup media can replace the placeholders later without changing the overall structure.

## Privacy

Do not put sensitive personal information into the preliminary RSVP. Guest data should use a proper protected backend before the public RSVP is launched.
