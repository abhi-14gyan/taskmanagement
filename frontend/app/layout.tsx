import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'TaskFlow — Task Management System',
    description: 'A scalable task management system with role-based access control',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} font-sans antialiased`}>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        expand={false}
                        richColors
                        toastOptions={{
                            style: {
                                background: 'rgba(15,18,40,0.95)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                                color: '#f1f5f9',
                            },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}
