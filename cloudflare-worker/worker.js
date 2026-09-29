const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

    try {
      const body = await request.json();
      const allowedAttendance = ["yes", "no", "maybe"];
      const allowedRegions = [
        "Metro Manila",
        "Bicol Region",
        "Caluya / Antique",
        "Elsewhere in the Philippines",
        "Outside the Philippines"
      ];

      const name = String(body.name || "").trim().slice(0, 120);
      const attendance = String(body.attendance || "").trim();
      const party = String(body.party || "").trim();
      const region = String(body.region || "").trim();
      const notes = String(body.notes || "").trim().slice(0, 500);

      if (!name || !allowedAttendance.includes(attendance) || !allowedRegions.includes(region) || !["1","2","3","4","5+"].includes(party)) {
        return json({ error: "Please provide valid RSVP details." }, 400);
      }

      const id = crypto.randomUUID();
      const record = {
        id,
        submittedAt: new Date().toISOString(),
        name,
        attendance,
        party,
        region,
        notes
      };

      const path = `data/rsvps/${new Date().toISOString().slice(0,10)}-${id}.json`;
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(record, null, 2) + "\n")));
      const url = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`;

      const gh = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "babycakes-rsvp"
        },
        body: JSON.stringify({
          message: `RSVP: ${name}`,
          content
        })
      });

      if (!gh.ok) {
        return json({ error: "Could not save RSVP." }, 502);
      }

      return json({ ok: true, id });
    } catch {
      return json({ error: "Invalid request." }, 400);
    }
  }
};