import { supabaseServer } from '@/lib/Server';
import { SearchBooks } from '@/app/MyBooks/search_books';
import AuthForm from '@/app/auth/authForm';

export default async function Home() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) {
    return <AuthForm />;
  }
  return (
    <div>
      <SearchBooks />
    </div>
  );
}
