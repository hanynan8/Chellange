// app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        name: { label: "Name", type: "text" },
        phone: { label: "Phone", type: "text" },
        address: { label: "Address", type: "text" },
        paymentMethod: { label: "Payment Method", type: "text" }
      },

      async authorize(credentials) {
        if (!credentials?.name) {
          return null;
        }

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        try {
          const checkResponse = await fetch(`${baseUrl}/api/data?collection=auth`, {
            cache: 'no-store'
          });
          
          if (!checkResponse.ok) {
            console.error('Failed to fetch auth data:', checkResponse.status);
            return null;
          }

          const authData = await checkResponse.json();
          
          let user = null;
          
          if (Array.isArray(authData)) {
            user = authData.find(u => u.name?.toLowerCase().trim() === credentials.name.toLowerCase().trim());
          } else if (authData.auth && Array.isArray(authData.auth)) {
            user = authData.auth.find(u => u.name?.toLowerCase().trim() === credentials.name.toLowerCase().trim());
          } else if (authData.data && Array.isArray(authData.data)) {
            user = authData.data.find(u => u.name?.toLowerCase().trim() === credentials.name.toLowerCase().trim());
          }

          if (!user) {
            console.log('User not found for name:', credentials.name);
            return null;
          }

          return {
            id: user._id?.toString() || user.name,
            name: user.name,
            phone: user.phone || credentials.phone,
            address: user.address || credentials.address,
            paymentMethod: user.paymentMethod || credentials.paymentMethod || 'cash'
          };
        } catch (error) {
          console.error('Auth Error:', error);
          return null;
        }
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },
  
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.phone = user.phone;
        token.address = user.address;
        token.paymentMethod = user.paymentMethod;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.phone = token.phone;
        session.user.address = token.address;
        session.user.paymentMethod = token.paymentMethod;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };