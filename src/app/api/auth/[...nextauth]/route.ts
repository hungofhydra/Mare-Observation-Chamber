import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;
        const ok = await user.comparePassword(credentials.password);
        if (!ok) return null;
        return { id: user._id.toString(), email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages:   { signIn: '/admin/login' },
  secret:  process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
