import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool(); // uses .env.local

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [credentials.email]);
        const user = res.rows[0];

        if (user && await compare(credentials.password, user.password)) {
          return {
            id: user.id,
            name: user.name,
            email: user.email
          };
        }

        throw new Error("Invalid email or password");
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const res = await pool.query(`
          SELECT r.name FROM roles r
          JOIN user_roles ur ON ur.role_id = r.id
          WHERE ur.user_id = $1
        `, [user.id]);

        token.roles = res.rows.map(r => r.name);
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.roles = token.roles || [];
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
});
