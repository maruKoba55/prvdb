import { supabaseServer } from '@/lib/Server';
import { redirect } from 'next/navigation';
import LoginForm from '@/app/auth/loginForm';

export default async function Home() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (user) {
    redirect('/application_select');
  }
  return <LoginForm />;
}
