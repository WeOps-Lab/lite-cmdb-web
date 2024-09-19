import KeycloakProvider from "next-auth/providers/keycloak";
import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

async function requestRefreshOfAccessToken(token: JWT) {
  const response = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID!,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken! as string,
    }),
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  return response.json();
}

async function fetchUserInfo(accessToken: string) {
  const response = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }

  return response.json();
}

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 30,
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;

        if (token.accessToken) {
          try {
            const userInfo = await fetchUserInfo(token.accessToken);
            token.locale = userInfo.locale || 'en';
            token.roles = userInfo.roles || [];
            token.username = userInfo.preferred_username || '';
          } catch (error) {
            console.error("Error fetching user info", error);
          }
        }
        return token;
      }

      const expiresAt = token.expiresAt ? Number(token.expiresAt) : 0;
      if (Date.now() < expiresAt * 1000 - 60 * 1000) {
        return token;
      } else {
        try {
          const tokens = await requestRefreshOfAccessToken(token);

          const updatedToken: JWT = {
            ...token,
            idToken: tokens.id_token,
            accessToken: tokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000 + (tokens.expires_in as number)),
            refreshToken: tokens.refresh_token ?? token.refreshToken,
          };

          // 获取用户信息
          try {
            const userInfo = await fetchUserInfo(updatedToken?.accessToken ?? '');
            updatedToken.locale = userInfo.locale || 'en';
            updatedToken.username = userInfo.preferred_username || '';
          } catch (error) {
            console.error("Error fetching user info", error);
          }

          return updatedToken;
        } catch (error) {
          console.error("Error refreshing access token", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token.error) {
        session.error = token.error;
      }
      if (token.username) {
        session.username = token.username;
      }
      if (token.locale) {
        session.locale = token.locale;
      }
      return session;
    },
  },
}