import { redirect } from 'next/navigation';

// Redirect root to the dashboard (PrivateRoute handles unauthenticated redirect to /login)
export default function Home() {
    redirect('/dashboard');
}
