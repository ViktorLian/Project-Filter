import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createAdminClient } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';

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
        if (!credentials?.email || !credentials.password) return null;

        try {
          const supabase = createAdminClient();

          // --- Method 1: Supabase Auth (preferred, for all new users) ---
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (signInData?.user) {
            // Look up the public.users record linked to this auth user
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('auth_user_id', signInData.user.id)
              .single();

            if (userData) {
              const companyId = userData.id; // companyId == user.id in FlowPilot
              return {
                id: userData.id,
                email: userData.email,
                name: userData.business_name || userData.name,
                companyId,
              };
            }
          }

          // --- Method 2: Legacy bcrypt users created by stripe webhook ---
          // (users in public.users with a hashed 'password' field but no Supabase Auth account)
          const { data: legacyUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .maybeSingle();

          if (legacyUser?.password) {
            const valid = await bcrypt.compare(credentials.password, legacyUser.password);
            if (!valid) return null;

            // Upgrade this user to a proper Supabase Auth account on first successful login
            const { data: upgraded } = await supabase.auth.admin.createUser({
              email: credentials.email,
              password: credentials.password,
              email_confirm: true,
              user_metadata: {
                name: legacyUser.name || legacyUser.business_name,
                business_name: legacyUser.business_name || legacyUser.name,
              },
            });
            if (upgraded?.user) {
              await supabase
                .from('users')
                .update({ auth_user_id: upgraded.user.id })
                .eq('id', legacyUser.id);
            }

            const companyId = legacyUser.company_id || legacyUser.id;
            return {
              id: legacyUser.id,
              email: legacyUser.email,
              name: legacyUser.name || legacyUser.business_name,
              companyId,
            };
          }

          return null;
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
        token.companyId = (user as any).companyId || user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).companyId = (token.companyId || token.id) as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
