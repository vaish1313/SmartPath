import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",   // ← ADD THIS
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.role = "patient"
      }
      return token
    },
    async session({ session, token }) {
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to our custom callback handler instead of directly to /portal
      // This allows proper token exchange and authentication setup
      return `${baseUrl}/auth/google/callback`
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }