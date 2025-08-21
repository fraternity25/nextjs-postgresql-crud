import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool(); // uses .env.local

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [
          credentials.email
        ]);
        const user = res.rows[0];

        if (user && await compare(credentials.password, user.password)) {
          return {
            id: user.id,
            name: user.name,
            email: user.email
          };
        }

        //throw new Error("Invalid email or password");
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    /*maxAge: 24 * 60 * 60, // 24 hour
    updateAge: 60 * 60,   // refresh per hour*/
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // Always refresh role (auto-refresh on each request)
      if (token?.id) {
        const res = await pool.query(
          `SELECT u.id, u.name, u.email, r.name as role
           FROM users u
           JOIN roles r ON u.role_id = r.id
           WHERE u.id = $1`,
          [token.id]
        );
        const dbUser = res.rows[0];
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.role = dbUser.role || "viewer";
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role || "viewer";
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};