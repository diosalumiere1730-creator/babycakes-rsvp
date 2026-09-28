# Babycakes RSVP API

This Cloudflare Worker receives RSVP submissions and writes each response as a separate JSON file in the GitHub repository.

## Secrets

Set this secret in Cloudflare:

- `GITHUB_TOKEN` — a GitHub fine-grained token with **Contents: Read and write** access to this repository only.

Never put the token in the website code or commit it to GitHub.

## Deploy

From this folder:

```bash
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
npx wrangler deploy
```

The deployed Worker URL is then used as the RSVP API endpoint.

## Endpoint

`POST /` with JSON:

```json
{
  "name": "Guest Name",
  "attendance": "yes",
  "partySize": 2,
  "origin": "Metro Manila",
  "note": ""
}
```

The Worker creates a separate file under `data/rsvps/` for every submission, avoiding a shared-file write conflict when multiple guests RSVP at the same time.
