import { useEffect } from 'react';

const BlockBackNavigation = () => {

  useEffect(() => {
    const handlePopstate = () => {
      window.history.pushState(null, "", window.location.href);
    };

    if (typeof window.history.pushState === 'function') {
      window.history.pushState(null, "", window.location.href);
      window.addEventListener('popstate', handlePopstate);
    }

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  return null;
};

export default BlockBackNavigation;
