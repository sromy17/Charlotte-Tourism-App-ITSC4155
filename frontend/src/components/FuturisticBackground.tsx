import React from 'react';

type FuturisticBackgroundProps = {
  showNoise?: boolean;
  showVignette?: boolean;
};

const FuturisticBackground: React.FC<FuturisticBackgroundProps> = ({
  showNoise = true,
  showVignette = true,
}) => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-radial from-emerald/10 via-transparent to-transparent opacity-80" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="futuristic-grid-layer absolute -inset-[18%] opacity-25 motion-reduce:animate-none" />
      </div>

      <div className="absolute -top-36 -left-20 h-[28rem] w-[28rem] rounded-full bg-radial from-emerald/20 via-emerald/10 to-transparent blur-3xl animate-float-slow motion-reduce:animate-none" />
      <div className="absolute top-[10%] -right-24 h-[26rem] w-[26rem] rounded-full bg-radial from-gold/20 via-gold/10 to-transparent blur-3xl animate-float-slower motion-reduce:animate-none" />
      <div className="absolute bottom-[-8rem] left-[22%] h-[24rem] w-[24rem] rounded-full bg-radial from-emerald/15 via-emerald/8 to-transparent blur-3xl animate-float-slow motion-reduce:animate-none" />

      {showNoise && <div className="noise absolute inset-0" />}
      {showVignette && <div className="vignette absolute inset-0" />}
    </div>
  );
};

export default FuturisticBackground;