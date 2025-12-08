import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@admin.com";
  const password = "admin123";
  const firstName = "Admin";
  const lastName = "User";
  const hashedPassword = await bcrypt.hash(password, 10);
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    console.log("Admin user already exists:", existing[0]);
    return;
  }
  const newUser = await db.insert(users).values({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    isAdmin: true,
  }).returning();
  console.log("Admin user created:", newUser[0]);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
