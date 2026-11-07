const MODEL = 'openai/gpt-oss-120b';

export default function health(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  return res.status(200).json({ ok:true, provider:'groq', configured:Boolean(process.env.GROQ_API_KEY), model:MODEL });
}
