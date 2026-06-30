import { useCallback, useEffect, useState } from 'react';

let hadKeyboardEvent = false;
let listenerCount = 0;

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    hadKeyboardEvent = true;
  }
}

function onPointerDown() {
  hadKeyboardEvent = false;
}

function addListeners() {
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('mousedown', onPointerDown, true);
  document.addEventListener('pointerdown', onPointerDown, true);
}

function removeListeners() {
  document.removeEventListener('keydown', onKeyDown, true);
  document.removeEventListener('mousedown', onPointerDown, true);
  document.removeEventListener('pointerdown', onPointerDown, true);
}

export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    if (listenerCount === 0) {
      addListeners();
    }
    listenerCount++;

    return () => {
      listenerCount--;
      if (listenerCount === 0) {
        removeListeners();
      }
    };
  }, []);

  const onFocus = useCallback(() => {
    if (hadKeyboardEvent) {
      setIsFocusVisible(true);
    }
  }, []);

  const onBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  return {
    isFocusVisible,
    focusVisibleProps: { onFocus, onBlur },
  };
}
