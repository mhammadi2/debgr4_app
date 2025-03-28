// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
// Import other providers as needed

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Your authentication logic here
        // This is just an example - implement your actual auth logic
        if (
          credentials?.email === 'user@example.com' &&
          credentials?.password === 'password'
        ) {
          return { id: '1', name: 'User', email: 'user@example.com' }
        }
        return null
      },
    }),
    // Add other providers as needed
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // Add these debugging callbacks
    async session({ session, token }) {
      console.log('Session callback:', { session, token })
      return session
    },
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user })
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
