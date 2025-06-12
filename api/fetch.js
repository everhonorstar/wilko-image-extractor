
export default async function handler(req, res) {
  const { url, code } = req.query;
  if (!url || !code) {
    return res.status(400).json({ error: "Missing URL or product code" });
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
    const pattern = new RegExp(`/assets/[^"]*${code}-\\d+\\.jpg`, 'g');
    const matches = [...html.matchAll(/src="([^"]+\.jpg)"/g)]
      .map(m => m[1])
      .filter(link => link.includes(code));
    const fullLinks = matches.map(src => src.startsWith('http') ? src : `https://www.wilko.com${src}`);
    res.status(200).json({ links: fullLinks });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch or parse" });
  }
}
