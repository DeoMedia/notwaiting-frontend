import { useEffect, useRef } from 'react';

interface TickerProps {
  items: string[];
}

export function Ticker({ items }: TickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // Respect accessibility preference — freeze the ticker for users with vestibular disorders
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let scrollPosition = 0;
    const scroll = () => {
      scrollPosition += 0.5;
      if (scrollPosition >= scrollElement.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollElement.scrollLeft = scrollPosition;
    };

    const interval = setInterval(scroll, 20);
    return () => clearInterval(interval);
  }, []);

  const doubledItems = [...items, ...items];

  return (
    <div
      ref={scrollRef}
      className="overflow-hidden whitespace-nowrap"
      style={{ scrollBehavior: 'auto' }}
    >
      <div className="inline-flex gap-8">
        {doubledItems.map((item, index) => (
          <span key={index} className="text-sm font-mono">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
