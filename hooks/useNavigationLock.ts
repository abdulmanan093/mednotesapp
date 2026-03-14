import { useRef, useCallback } from "react";

const LOCK_DURATION_MS = 700;

/**
 * Prevents accidental double-navigation from rapid/double taps.
 * Usage:
 *   const navigate = useNavigationLock();
 *   <TouchableOpacity onPress={() => navigate(() => router.push("/some/path"))} />
 */
export function useNavigationLock() {
  const isLocked = useRef(false);

  const navigate = useCallback((action: () => void) => {
    if (isLocked.current) return;
    isLocked.current = true;
    action();
    setTimeout(() => {
      isLocked.current = false;
    }, LOCK_DURATION_MS);
  }, []);

  return navigate;
}
