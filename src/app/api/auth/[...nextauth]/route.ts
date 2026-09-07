import NextAuth, { AuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        const dbUser = user as unknown as { id: string; email: string; name: string | null; role?: string };
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role || "MEMBER",
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        const u = session.user as unknown as { id?: string; role?: string };
        u.id = token.id as string;
        u.role = (token.role as string) || "MEMBER";
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user: User | undefined }) {
      // On first login, get role from the user object returned by authorize()
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role?: string }).role || "MEMBER";
      }
      
      // Always re-fetch the latest role from DB to reflect any admin changes
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
          }) as unknown as { role: string } | null;
          if (dbUser) {
            token.role = dbUser.role || "MEMBER";
          }
        } catch {
          // keep existing token.role on DB error
        }
      }

      return token;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
