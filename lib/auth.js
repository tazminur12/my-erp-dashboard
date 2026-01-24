import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDb } from './mongodb';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const db = await getDb();
          const usersCollection = db.collection('users');

          // Find user by email
          const user = await usersCollection.findOne({
            email: credentials.email.toLowerCase(),
          });

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Check if user is active
          if (user.status !== 'active') {
            throw new Error('Your account has been deactivated');
          }

          // Return user object (without password)
          // Only store image URL, not base64 data to avoid cookie size issues
          let imageUrl = user.image || user.profileImage || user.avatar || null;
          // If image is base64 data URL, don't store it in token (too large)
          if (imageUrl && imageUrl.startsWith('data:image')) {
            imageUrl = null; // Will be fetched from database when needed
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || user.email.split('@')[0],
            role: user.role || 'user',
            phone: user.phone || '',
            image: imageUrl, // Only URL, not base64
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in - only store minimal data
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        // Only store phone if it's short (not a large object)
        token.phone = user.phone || '';
        // Only store image URL if it's not base64 (base64 images are too large)
        if (user.image && !user.image.startsWith('data:image')) {
          token.image = user.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send minimal properties to the client
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email || session.user.email;
        session.user.name = token.name || session.user.name;
        session.user.role = token.role;
        session.user.phone = token.phone || '';
        // Only include image if it's a URL, not base64
        if (token.image && !token.image.startsWith('data:image')) {
          session.user.image = token.image;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days - same as session
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        domain: process.env.NODE_ENV === 'production' ? undefined : undefined, // Use default domain
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Disable debug in production to reduce cookie size
  trustHost: true, // Trust the host header (important for proper cookie handling)
};

export async function getSession() {
  return await getServerSession(authOptions);
}
