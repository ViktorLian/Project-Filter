import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createAdminClient } from '@/lib/supabase/admin';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const supabase = createAdminClient();

          // List all users and find by email (Supabase limitation)
          const { data, error } = await supabase.auth.admin.listUsers();

          const authUser = data?.users?.find(u => u.email === credentials.email);
          if (!authUser) {
            return null;
          }

          // Get user profile from public.users table
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', authUser.id)
            .single();

          if (!userData) {
            return null;
          }

          return {
            id: userData.id,
            email: userData.email,
            name: userData.business_name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
