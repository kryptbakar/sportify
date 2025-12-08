import session from "express-session";
import type { Express, Request, RequestHandler } from "express";
import type { SessionData } from "express-session";
import { EventEmitter } from "events";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      isAuthenticated?: () => boolean;
      login?: (user: any, cb?: (err: any) => void) => void;
      logout?: (cb?: (err: any) => void) => void;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      isAdmin: boolean;
    };
  }
}

// In-memory session store for local development with proper EventEmitter interface
class MemoryStore extends EventEmitter implements session.Store {
  private sessions: Map<string, any> = new Map();

  get(sid: string, callback: (err: any, session?: SessionData | null) => void) {
    const sess = this.sessions.get(sid);
    console.log(`[MemoryStore.get] sid: ${sid}, found: ${!!sess}`);
    callback(null, sess || null);
  }

  set(sid: string, sessionData: SessionData, callback?: (err?: any) => void) {
    console.log(`[MemoryStore.set] sid: ${sid}, user: ${sessionData.user?.email}`);
    this.sessions.set(sid, sessionData);
    if (callback) callback();
  }

  destroy(sid: string, callback?: (err?: any) => void) {
    this.sessions.delete(sid);
    if (callback) callback();
  }

  regenerate(req: Request, callback: (err?: any) => void) {
    callback();
  }

  load(sid: string, callback: (err: any, session?: SessionData) => void) {
    const sess = this.sessions.get(sid);
    callback(null, sess);
  }

  touch(sid: string, sessionData: SessionData, callback?: (err?: any) => void) {
    if (callback) callback();
  }

  clear(callback?: (err?: any) => void) {
    this.sessions.clear();
    if (callback) callback();
  }

  all(callback?: (err?: any, obj?: any) => void) {
    if (callback) callback(null, Object.fromEntries(this.sessions));
  }

  length(callback?: (err?: any, length?: number) => void) {
    if (callback) callback(null, this.sessions.size);
  }

  createSession(req: Request, sessionData: SessionData) {
    return sessionData as any;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  return session({
    secret: process.env.SESSION_SECRET || "local-dev-secret-key",
    store: new MemoryStore(),
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());

  // Create mock user
  const mockUser = {
    id: "local-test-user",
    email: "test@local.com",
    firstName: "Test",
    lastName: "User",
    profileImageUrl: null,
    isAdmin: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock login endpoint - GET version
  app.get("/api/login", async (req, res) => {
    try {
      req.session.userId = mockUser.id;
      req.session.user = mockUser;
      
      // Save session before redirecting
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        // Now redirect to home
        res.redirect("/");
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // POST version for form submissions
  app.post("/api/login", async (req, res) => {
    try {
      req.session.userId = mockUser.id;
      req.session.user = mockUser;
      
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ success: true, user: mockUser });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    console.log("Auth check - session:", req.session?.user);
    if (req.session?.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Logout
  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}

// Simple middleware to check authentication
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
