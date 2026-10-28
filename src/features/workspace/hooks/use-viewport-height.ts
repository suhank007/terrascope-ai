import { useEffect, useState } from "react";

/** The visual viewport height in px, tracking mobile browser chrome showing/hiding. */
export function useViewportHeight(fallback = 800) {
  const [height, setHeight] = useState(fallback);

  useEffect(() => {
    const update = () => setHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return height;
}
