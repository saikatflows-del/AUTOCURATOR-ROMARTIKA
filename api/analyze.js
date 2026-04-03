export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({
      style: "Abstract Expressionism",
      similar_artists: ["Mark Rothko", "Gerhard Richter"],
      estimate: "$500 - $5000",
      note: "Connect OpenAI API here."
    });
  } catch (error) {
    res.status(500).json({ error: 'Error processing image' });
  }
}
