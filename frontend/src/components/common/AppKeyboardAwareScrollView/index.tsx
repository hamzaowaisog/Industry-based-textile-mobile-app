import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
} from 'react';

import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
  type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';

type ScrollFocusedInputIntoView = () => void;

const KeyboardScrollContext = createContext<ScrollFocusedInputIntoView | null>(null);

/**
 * Imperatively ask the nearest `AppKeyboardAwareScrollView` to scroll the
 * currently focused input into view. Returns a no-op when called outside a
 * provider (e.g. inputs rendered in modals / non-scrollable surfaces).
 *
 * Needed because `react-native-keyboard-controller` only auto-scrolls on
 * keyboard *events* — when the keyboard is already open and focus moves between
 * fields (e.g. pressing "Next" / `onSubmitEditing` → `ref.focus()`), no event
 * fires and the target input can stay hidden behind the keyboard.
 */
export const useKeyboardScrollToFocusedInput = (): ScrollFocusedInputIntoView => {
  const scrollToFocusedInput = useContext(KeyboardScrollContext);
  return useCallback(() => {
    scrollToFocusedInput?.();
  }, [scrollToFocusedInput]);
};

type AppKeyboardAwareScrollViewProps = KeyboardAwareScrollViewProps & {
  children: React.ReactNode;
};

export const AppKeyboardAwareScrollView = ({
  children,
  ...rest
}: AppKeyboardAwareScrollViewProps) => {
  const ref = useRef<KeyboardAwareScrollViewRef>(null);

  const scrollToFocusedInput = useCallback(() => {
    ref.current?.assureFocusedInputVisible();
  }, []);

  return (
    <KeyboardScrollContext.Provider value={scrollToFocusedInput}>
      <KeyboardAwareScrollView ref={ref} {...rest}>
        {children}
      </KeyboardAwareScrollView>
    </KeyboardScrollContext.Provider>
  );
};
