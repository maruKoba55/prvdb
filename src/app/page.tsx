import { supabaseServer } from '@/lib/Server';
import ApplicationSelect from './application_select';
import AuthForm from '@/app/auth/authForm';

export default async function Home() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) return <AuthForm />;

  return (
    <div>
      <ApplicationSelect />
    </div>
  );
}
