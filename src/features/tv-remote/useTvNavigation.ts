import { useEffect, useCallback } from 'react';

/**
 * TV D-Pad Navigation Engine
 * Implements 4-way spatial navigation across TV focusable nodes per DESIGN.md §4 & RULES.md §3
 */
export const useTvNavigation = (enabled: boolean = true) => {
  const getFocusableElements = useCallback((): HTMLElement[] => {
    // Collect visible, non-disabled focusable elements in the current DOM
    const selector = 'button:not([disabled]), [tabindex="0"], a[href], input:not([disabled]), textarea:not([disabled]), [data-tv-focus="true"]';
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    
    // Filter out hidden or collapsed elements
    return elements.filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        style.opacity !== '0'
      );
    });
  }, []);

  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const focusables = getFocusableElements();
    if (focusables.length === 0) return;

    const current = (document.activeElement as HTMLElement) || focusables[0];
    const currentRect = current.getBoundingClientRect();
    const currentCenterX = currentRect.left + currentRect.width / 2;
    const currentCenterY = currentRect.top + currentRect.height / 2;

    let bestCandidate: HTMLElement | null = null;
    let shortestDistance = Infinity;

    for (const el of focusables) {
      if (el === current) continue;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = centerX - currentCenterX;
      const deltaY = centerY - currentCenterY;

      let isValidDirection = false;
      let primaryDistance = 0;
      let secondaryDistance = 0;

      switch (direction) {
        case 'right':
          isValidDirection = deltaX > 8;
          primaryDistance = deltaX;
          secondaryDistance = Math.abs(deltaY);
          break;
        case 'left':
          isValidDirection = deltaX < -8;
          primaryDistance = Math.abs(deltaX);
          secondaryDistance = Math.abs(deltaY);
          break;
        case 'down':
          isValidDirection = deltaY > 8;
          primaryDistance = deltaY;
          secondaryDistance = Math.abs(deltaX);
          break;
        case 'up':
          isValidDirection = deltaY < -8;
          primaryDistance = Math.abs(deltaY);
          secondaryDistance = Math.abs(deltaX);
          break;
      }

      if (isValidDirection) {
        // Weighted Manhattan distance with heavy preference to aligned primary axis
        const score = primaryDistance + secondaryDistance * 2.2;
        if (score < shortestDistance) {
          shortestDistance = score;
          bestCandidate = el;
        }
      }
    }

    if (bestCandidate) {
      bestCandidate.focus();
      bestCandidate.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [getFocusableElements]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in a real text input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveFocus('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveFocus('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveFocus('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveFocus('right');
          break;
        case 'Enter':
          if (document.activeElement && document.activeElement instanceof HTMLElement) {
            document.activeElement.click();
          }
          break;
      }
    };

    // Custom virtual remote event dispatch listener
    const handleVirtualRemoteEvent = (e: CustomEvent<{ key: string }>) => {
      const key = e.detail?.key;
      switch (key) {
        case 'up':
          moveFocus('up');
          break;
        case 'down':
          moveFocus('down');
          break;
        case 'left':
          moveFocus('left');
          break;
        case 'right':
          moveFocus('right');
          break;
        case 'select':
          if (document.activeElement && document.activeElement instanceof HTMLElement) {
            document.activeElement.click();
          }
          break;
        case 'back': {
          const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
          document.dispatchEvent(escEvent);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('tv-remote-action', handleVirtualRemoteEvent as EventListener);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('tv-remote-action', handleVirtualRemoteEvent as EventListener);
    };
  }, [enabled, moveFocus]);

  return { moveFocus };
};

export const triggerVirtualRemoteKey = (key: 'up' | 'down' | 'left' | 'right' | 'select' | 'back' | 'home' | 'play_pause') => {
  const event = new CustomEvent('tv-remote-action', { detail: { key } });
  window.dispatchEvent(event);
};
