import { useEffect, useState } from "react";
import { AUTH_EVENTS, getUser, onAuthChange, type User } from "@netlify/identity";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const check = (nextUser: User | null) => {
      if (!active) return;
      setUser(nextUser);
      if (!nextUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(nextUser.roles?.includes("admin") ?? false);
      setLoading(false);
    };

    void getUser().then(check);
    const unsubscribe = onAuthChange((event, nextUser) => {
      if (
        event !== AUTH_EVENTS.LOGIN &&
        event !== AUTH_EVENTS.LOGOUT &&
        event !== AUTH_EVENTS.USER_UPDATED
      )
        return;
      check(nextUser);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading, signedIn: Boolean(user) };
}
