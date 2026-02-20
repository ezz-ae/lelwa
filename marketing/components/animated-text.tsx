"use client"

interface AnimatedTextProps {
  text: string
}

export function AnimatedText({ text }: AnimatedTextProps) {
  return (
    <span>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            animationName: "blur-reveal",
            animationDuration: "0.6s",
            animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            animationFillMode: "forwards",
            animationDelay: `${i * 0.03}s`,
            opacity: 0,
            display: char === " " ? "inline" : "inline-block",
          }}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  )
}
