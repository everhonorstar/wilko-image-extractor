
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

    const matches = [...html.matchAll(/src="([^"]+\.jpg)"/g)]
      .map(m => m[1])
      .filter(link => link.includes(code));

    const seen = new Set();
    const fullLinks = [];
    for (const src of matches) {
      const full = src.startsWith('http') ? src : `https://www.wilko.com${src}`;
      if (!seen.has(full)) {
        seen.add(full);
        fullLinks.push(full);
      }
    }

    // Extract embedded JSON
    const jsonMatch = html.match(/<script type="application\/json">({.*?})<\/script>/s);
    let name = '', wasPrice = '', nowPrice = '', description = '';
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
        const product = jsonData.product || {};
        name = product.name || '';
        wasPrice = product.price?.was || '';
        nowPrice = product.price?.now || '';
        description = product.longDescription || '';
      } catch (e) {
        console.error("Failed to parse JSON data.");
      }
    }

    const info = `Name: ${name}\nWas Price: ${wasPrice}\nNow Price: ${nowPrice}\nDescription: ${description}`;

    res.status(200).json({ links: fullLinks, info });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch or parse" });
  }
}
