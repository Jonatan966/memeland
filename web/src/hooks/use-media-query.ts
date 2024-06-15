import { useEffect, useState } from "react";

export function useMediaQuery(queries: string[]) {
  const [matchIndex, setMatchIndex] = useState(-1);

  useEffect(() => {
    const watchQueries = queries.reduce(
      (acc, query) => [...acc, window.matchMedia(query)],
      [] as MediaQueryList[],
    );

    const listener = () => {
      const firstMatchedQuery = watchQueries.findIndex((query) =>
        query.matches
      );

      if (matchIndex !== firstMatchedQuery) {
        setMatchIndex(firstMatchedQuery);
      }
    };

    listener();

    window.addEventListener("resize", listener);

    return () => window.removeEventListener("resize", listener);
  }, [matchIndex, queries]);

  return matchIndex;
}
