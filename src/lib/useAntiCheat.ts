'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface AntiCheatConfig {
  enabled: boolean;
  maxViolations: number;
  onViolation: (type: string, details?: string) => void;
  onAutoSubmit: () => void;
  enableFullscreen?: boolean;
  enableTabDetection?: boolean;
  enableCopyBlock?: boolean;
  enableRightClickBlock?: boolean;
  enableKeyboardBlock?: boolean;
  enableDevToolsBlock?: boolean;
  enableResizeDetection?: boolean;
  enableWatermark?: boolean;
  candidateName?: string;
  candidateId?: string;
}

interface AntiCheatState {
  violationCount: number;
  violations: Array<{ type: string; timestamp: number; details?: string }>;
  isFullscreen: boolean;
  isActive: boolean;
}

export function useAntiCheat(config: AntiCheatConfig) {
  const {
    enabled,
    maxViolations,
    onViolation,
    onAutoSubmit,
    enableFullscreen = true,
    enableTabDetection = true,
    enableCopyBlock = true,
    enableRightClickBlock = true,
    enableKeyboardBlock = true,
    enableDevToolsBlock = true,
    enableResizeDetection = true,
    enableWatermark = false,
    candidateName = '',
    candidateId = '',
  } = config;

  const [state, setState] = useState<AntiCheatState>({
    violationCount: 0,
    violations: [],
    isFullscreen: false,
    isActive: false,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const watermarkRef = useRef<HTMLDivElement | null>(null);

  // Add violation
  const addViolation = useCallback((type: string, details?: string) => {
    const newViolation = { type, timestamp: Date.now(), details };
    const newCount = stateRef.current.violationCount + 1;

    setState(prev => ({
      ...prev,
      violationCount: newCount,
      violations: [...prev.violations, newViolation],
    }));

    onViolation(type, details);

    if (newCount >= maxViolations) {
      onAutoSubmit();
    }
  }, [maxViolations, onViolation, onAutoSubmit]);

  // Fullscreen API - Cross-browser
  const enterFullscreen = useCallback(async () => {
    if (!enableFullscreen) return;
    try {
      const elem = containerRef.current || document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      setState(prev => ({ ...prev, isFullscreen: true }));
    } catch (err) {
      console.warn('Fullscreen not supported:', err);
    }
  }, [enableFullscreen]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setState(prev => ({ ...prev, isFullscreen: false }));
    } catch (err) {
      console.warn('Exit fullscreen error:', err);
    }
  }, []);

  // Tab/Window switch detection
  useEffect(() => {
    if (!enabled || !enableTabDetection) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addViolation('tab_switch', 'User switched to another tab or minimized window');
      }
    };

    const handleBlur = () => {
      addViolation('window_blur', 'User clicked outside the test window');
    };

    const handleFocus = () => {
      // Optional: Re-focus to test when returning
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, enableTabDetection, addViolation]);

  // Copy/Cut/Paste blocking
  useEffect(() => {
    if (!enabled || !enableCopyBlock) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation('copy_attempt', 'User attempted to copy content');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation('cut_attempt', 'User attempted to cut content');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation('paste_attempt', 'User attempted to paste content');
    };

    const handleSelectStart = (e: Event) => {
      // Allow selection in input fields
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [enabled, enableCopyBlock, addViolation]);

  // Right-click blocking
  useEffect(() => {
    if (!enabled || !enableRightClickBlock) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation('right_click', 'User attempted to open context menu');
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [enabled, enableRightClickBlock, addViolation]);

  // Keyboard shortcut blocking
  useEffect(() => {
    if (!enabled || !enableKeyboardBlock) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block DevTools shortcuts
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.key === 'F12') ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && (e.key === 'p' || e.key === 'P')) ||
        (e.altKey && (e.key === 'Tab')) ||
        (e.ctrlKey && (e.key === 'Tab')) ||
        (e.metaKey && (e.key === 'Tab'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        addViolation('blocked_shortcut', `Blocked key combination: ${e.key}`);
        return false;
      }

      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        addViolation('print_screen', 'User attempted to take screenshot');
      }

      // Block Alt key alone (menu focus)
      if (e.key === 'Alt' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, enableKeyboardBlock, addViolation]);

  // DevTools detection
  useEffect(() => {
    if (!enabled || !enableDevToolsBlock) return;

    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        addViolation('devtools_open', 'Developer tools detected');
      }
    };

    const interval = setInterval(detectDevTools, 1000);

    return () => clearInterval(interval);
  }, [enabled, enableDevToolsBlock, addViolation]);

  // Window resize detection
  useEffect(() => {
    if (!enabled || !enableResizeDetection) return;

    const handleResize = () => {
      const isSmaller = window.innerWidth < screen.width - 10 || window.innerHeight < screen.height - 10;
      if (isSmaller && document.fullscreenElement) {
        addViolation('fullscreen_exit', 'User exited fullscreen mode');
        // Try to re-enter fullscreen
        enterFullscreen();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [enabled, enableResizeDetection, addViolation, enterFullscreen]);

  // Fullscreen change detection
  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement || !!(document as any).msFullscreenElement;
      setState(prev => ({ ...prev, isFullscreen }));

      if (!isFullscreen && stateRef.current.isActive) {
        addViolation('fullscreen_exit', 'User exited fullscreen mode');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [enabled, addViolation]);

  // BeforeUnload guard
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your test will be submitted.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);

  // Dynamic watermark
  useEffect(() => {
    if (!enabled || !enableWatermark || !candidateName) return;

    const createWatermark = () => {
      if (watermarkRef.current) return;

      const watermark = document.createElement('div');
      watermark.style.position = 'fixed';
      watermark.style.top = '0';
      watermark.style.left = '0';
      watermark.style.width = '100%';
      watermark.style.height = '100%';
      watermark.style.pointerEvents = 'none';
      watermark.style.zIndex = '9999';
      watermark.style.overflow = 'hidden';
      watermark.style.opacity = '0.1';
      watermark.style.fontSize = '14px';
      watermark.style.color = '#000';
      watermark.style.transform = 'rotate(-30deg)';
      watermark.style.userSelect = 'none';

      // Create repeating watermark text
      let content = '';
      for (let i = 0; i < 50; i++) {
        content += `${candidateName} ${candidateId || ''} ${new Date().toLocaleDateString()} • `;
      }
      watermark.textContent = content;

      document.body.appendChild(watermark);
      watermarkRef.current = watermark;
    };

    const removeWatermark = () => {
      if (watermarkRef.current) {
        document.body.removeChild(watermarkRef.current);
        watermarkRef.current = null;
      }
    };

    createWatermark();
    return removeWatermark;
  }, [enabled, enableWatermark, candidateName, candidateId]);

  // Set active state
  const setActive = useCallback((active: boolean) => {
    setState(prev => ({ ...prev, isActive: active }));
  }, []);

  return {
    state,
    containerRef,
    enterFullscreen,
    exitFullscreen,
    setActive,
    addViolation,
  };
}
