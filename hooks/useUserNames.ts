import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { userService } from "@/lib/api/users";

interface UserNamesCache {
  [userId: string]: string;
}

export function useUserNames(userIds: string[]) {
  const [userNames, setUserNames] = useState<UserNamesCache>({});
  const [loading, setLoading] = useState(true);
  const fetchedUserIdsRef = useRef<Set<string>>(new Set());

  // Memoize the unique user IDs to prevent unnecessary re-renders
  const uniqueUserIds = useMemo(() => {
    return Array.from(new Set(userIds.filter(Boolean)));
  }, [userIds.join(",")]); // Use join to create a stable dependency

  useEffect(() => {
    const fetchUserNames = async () => {
      if (uniqueUserIds.length === 0) {
        setLoading(false);
        return;
      }

      // Check which user IDs we still need to fetch
      const userIdsToFetch = uniqueUserIds.filter(
        (userId) => !fetchedUserIdsRef.current.has(userId)
      );

      if (userIdsToFetch.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const names: UserNamesCache = { ...userNames };

      // Fetch all user names in parallel
      const promises = userIdsToFetch.map(async (userId) => {
        try {
          const fullName = await userService.getUserFullNameById(userId);
          names[userId] = fullName;
          fetchedUserIdsRef.current.add(userId);
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error);
          names[userId] = "Unknown User";
          fetchedUserIdsRef.current.add(userId);
        }
      });

      await Promise.all(promises);
      setUserNames(names);
      setLoading(false);
    };

    fetchUserNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueUserIds.join(",")]); // Only depend on the stringified unique IDs

  const getUserName = useCallback(
    (userId: string): string => {
      return userNames[userId] || "Loading...";
    },
    [userNames]
  );

  return { userNames, loading, getUserName };
}
