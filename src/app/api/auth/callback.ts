import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '@/lib/Client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = supabaseClient();
  const { code } = req.query;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code as string);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.redirect('/'); // 認証後のリダイレクト先
  }

  res.status(400).json({ error: 'No code provided' });
}
