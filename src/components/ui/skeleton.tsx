type SkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(90deg, #E8E8E8 25%, #F2F2F2 50%, #E8E8E8 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
        borderRadius: "0.5rem",
        ...style,
      }}
    />
  );
}
