import React from 'react';

type SkeletonProps = {
  className?: string;
};

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return <div className={`rounded bg-white/10 animate-pulse motion-reduce:animate-none ${className}`} aria-hidden />;
};

export default Skeleton;
