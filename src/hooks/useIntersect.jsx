import React, { useEffect, useRef, useState } from "react";

export function useIntersection(ref) {
  const _options = {
    root: document.querySelector("body"),
    rootMargin: "0px",
    threshold: 1.0,
  };

  const [isVisible, setIsVisible] = useState(false);

  const observer = useRef();

  const onScroll = (entries, _observer) => {
    const [entry] = entries;
    setIsVisible(entry.isIntersecting);
  };

  useEffect(() => {
    observer.current = new IntersectionObserver(onScroll, _options);

    if (ref.current) observer.current.observe(ref.current);

    return () => {
      observer.current && observer.current.disconnect();
    };
  }, [ref]);

  return [observer.current.observe, isVisible];
}
