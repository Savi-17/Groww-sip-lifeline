const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'openai/gpt-oss-120b';

const systemPrompt = `You are Groww SIP Lifeline, a careful conversational assistant for a product prototype that helps mutual-fund investors think through temporary SIP cash-flow interruptions. You are not a lender, financial adviser, broker, or Groww representative. Do not promise returns, guarantee loan eligibility, claim the prototype loan is a real or approved offer, or pressure the user to borrow. Do not recommend selling investments. Ask a focused follow-up if key facts (timing, amount, duration) are missing. Distinguish temporary cash-flow gaps from recurring affordability problems, emergency expenses, income delays, job loss, debt pressure, overspending, and uncertainty. Give practical choices and explain their terms neutrally, without steering the user away from the continuity-loan concept merely because of its interest rate. When a user says they cannot afford an installment and asks how to continue, empathetically mention that they can explore the prototype's continuity-assistance concept as one option, alongside SIP changes, and invite them to review its terms. The continuity-loan option is a hypothetical product concept in this prototype, not a real offer; no money is lent, transferred, or invested. State its terms accurately when relevant: 0% interest for months 1-12, then 10% monthly on outstanding principal; principal remains repayable, and the repayment schedule and fees are not defined. Do not characterize the rate as affordable or make a personal borrowing recommendation. Never make up user facts. Return ONLY valid JSON with keys: detected (boolean), category (string), severity (low|medium|high), duration (string), summary (string), analysis (string), reply (string), recommendedAction (edit_sip|pause_sip|reschedule_sip|explore_loan|clarify|review_budget), alternatives (array of objects with key,title,description,reason), followUp (string), mentionedAmount (number or null). Keep reply concise, empathetic, and specific. If unrelated or insufficient, detected=false or recommendedAction=clarify, and ask one clear question. Alternatives should include relevant actions only; the UI separately keeps Edit SIP and Explore Loan available.`;
const responseSchema = {
  type:'object',
  properties:{
    detected:{type:'boolean'},
    category:{type:'string'},
    severity:{type:'string',enum:['low','medium','high']},
    duration:{type:'string'},
    summary:{type:'string'},
    analysis:{type:'string'},
    reply:{type:'string'},
    recommendedAction:{type:'string',enum:['edit_sip','pause_sip','reschedule_sip','explore_loan','clarify','review_budget']},
    alternatives:{type:'array',items:{type:'object',properties:{key:{type:'string'},title:{type:'string'},description:{type:'string'},reason:{type:'string'}},required:['key','title','description','reason'],additionalProperties:false}},
    followUp:{type:'string'},
    mentionedAmount:{type:['number','null']}
  },
  required:['detected','category','severity','duration','summary','analysis','reply','recommendedAction','alternatives','followUp','mentionedAmount'],
  additionalProperties:false
};

function respond(res, status, payload) {
  if (typeof res.status === 'function' && typeof res.json === 'function') return res.status(status).json(payload);
  res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' });
  res.end(JSON.stringify(payload));
}

async function getBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 20_000) throw new Error('Request too large');
  }
  return JSON.parse(data || '{}');
}

export default async function assistant(req, res) {
  if (req.method !== 'POST') return respond(res, 405, { error:'Method not allowed' });
  let body;
  try { body = await getBody(req); }
  catch { return respond(res, 400, { error:'Invalid JSON request or request too large.' }); }

  const message = String(body.message || '').trim().slice(0, 4000);
  if (!message) return respond(res, 400, { error:'Please describe your SIP cash-flow situation.' });
  if (!GROQ_API_KEY) return respond(res, 503, { error:'The AI assistant is not configured. Set GROQ_API_KEY on the server.' });
  const sips = Array.isArray(body.sips) ? body.sips.slice(0, 10).map(s => ({ fund:String(s.fund || '').slice(0,100), amount:Number(s.amount) || 0, status:String(s.status || '') })) : [];
  const history = Array.isArray(body.history) ? body.history.slice(-8).map(m => ({ role:m.role === 'assistant' ? 'assistant' : 'user', content:String(m.content || '').slice(0,1500) })) : [];
  const context = `Investor's current demo SIPs: ${JSON.stringify(sips)}. Selected SIP: ${JSON.stringify(body.selectedSip || null)}. User's latest message: ${message}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{ 'Authorization':`Bearer ${GROQ_API_KEY}`, 'Content-Type':'application/json' },
      signal:AbortSignal.timeout(35_000),
      body:JSON.stringify({ model:MODEL, temperature:0.25, max_completion_tokens:1800, response_format:{type:'json_schema',json_schema:{name:'sip_assessment',strict:true,schema:responseSchema}}, messages:[{role:'system',content:systemPrompt}, ...history, {role:'user',content:context}] })
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) return respond(res, response.status === 429 ? 429 : 502, { error:raw?.error?.message || `Groq request failed (${response.status}). Check your API key, model and account limits.` });
    const content = raw?.choices?.[0]?.message?.content;
    if (!content) return respond(res, 502, { error:'Groq returned an empty response. Please try again.' });
    let result;
    try { result = JSON.parse(content); }
    catch { return respond(res, 502, { error:'The AI response could not be parsed. Please try again.' }); }

    const allowed = ['edit_sip','pause_sip','reschedule_sip','explore_loan','clarify','review_budget'];
    result.detected = Boolean(result.detected);
    result.category = String(result.category || 'Unclassified cash-flow concern').slice(0,100);
    result.severity = ['low','medium','high'].includes(result.severity) ? result.severity : 'medium';
    result.duration = String(result.duration || 'Not specified').slice(0,100);
    result.summary = String(result.summary || 'Your cash-flow situation needs a little more context.').slice(0,300);
    result.analysis = String(result.analysis || '').slice(0,800);
    result.reply = String(result.reply || 'Could you share a little more about the amount and how long the cash-flow gap may last?').slice(0,1200);
    result.recommendedAction = allowed.includes(result.recommendedAction) ? result.recommendedAction : 'clarify';
    result.followUp = String(result.followUp || '').slice(0,250);
    result.mentionedAmount = result.mentionedAmount !== null && result.mentionedAmount !== undefined && Number.isFinite(Number(result.mentionedAmount)) ? Number(result.mentionedAmount) : null;
    result.alternatives = Array.isArray(result.alternatives) ? result.alternatives.slice(0,4).map(a => ({ key:String(a.key || 'review_budget'), title:String(a.title || 'Review your options').slice(0,80), description:String(a.description || '').slice(0,180), reason:String(a.reason || '').slice(0,180) })) : [];
    return respond(res, 200, { result, model:raw.model || MODEL });
  } catch (err) {
    return respond(res, 502, { error:err.name === 'TimeoutError' ? 'Groq took too long to respond. Please retry.' : 'Could not reach Groq. Check your internet connection and try again.' });
  }
}
