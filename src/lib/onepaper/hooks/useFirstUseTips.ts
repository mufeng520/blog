import { useEffect, useState } from 'react';

const FIRST_USE_TIPS_KEY = 'onepaper-first-use-tips-dismissed';

export function useFirstUseTips() {
  const [showFirstUseTips, setShowFirstUseTips] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(FIRST_USE_TIPS_KEY) !== 'true') {
      setShowFirstUseTips(true);
    }
  }, []);

  const closeFirstUseTips = () => {
    localStorage.setItem(FIRST_USE_TIPS_KEY, 'true');
    setShowFirstUseTips(false);
  };

  return {
    showFirstUseTips,
    closeFirstUseTips,
  };
}
