import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface HeartParticle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export const FloatingHearts = () => {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      size: 20 + Math.random() * 20,
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute bottom-0 animate-float-slow opacity-20"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
          }}
        >
          <Heart
            className="fill-primary text-primary"
            size={heart.size}
            style={{ filter: "blur(1px)" }}
          />
        </div>
      ))}
    </div>
  );
};
