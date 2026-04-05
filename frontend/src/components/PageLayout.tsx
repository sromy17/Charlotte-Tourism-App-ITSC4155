import React from 'react';

type PageLayoutProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

const PageLayout: React.FC<PageLayoutProps> = ({ children, className = '', contentClassName = '' }) => {
  return (
    <div className={`box-border w-full min-h-screen px-6 py-10 md:px-10 md:py-12 xl:px-12 ${className}`}>
      <div className={`mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col space-y-20 md:space-y-24 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
