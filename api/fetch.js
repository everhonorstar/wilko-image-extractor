
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html",
        "Referer": "https://www.wilko.com/"
      }
    });
    const html = await response.text();
    const matches = [...html.matchAll(/src=\"(\/assets\/[^\"]+-1\.jpg)\"/g)];
    const links = matches.map(m => "https://www.wilko.com" + m[1]);
    res.status(200).json({ links });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch or parse" });
  }
}
