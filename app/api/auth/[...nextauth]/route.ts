// File: app/api/auth/[...nextauth]/route.ts (Corrected)

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import the config object

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
