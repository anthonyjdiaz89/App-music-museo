declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.JPG' {
  const value: any;
  export default value;
}
declare module '*.gif';
declare module '*.bmp';
declare module '*.svg';

declare module '*.json' {
  const value: any;
  export default value;
}

import 'react';
import 'react-native';
import 'expo-blur';

declare module 'react-native' {
  interface NativeMethods {
      props: any;
      state: any;
      context: any;
      refs: any;
      forceUpdate(callback?: () => void): void;
      render(): React.ReactNode;
      setState(state: any, callback?: () => void): void;
  }

  interface FlatList<ItemT = any> {
      props: any;
      state: any;
      context: any;
      refs: any;
      forceUpdate(callback?: () => void): void;
      render(): React.ReactNode;
      setState(state: any, callback?: () => void): void;
  }

  interface ScrollView {
      props: any;
      state: any;
      context: any;
      refs: any;
      forceUpdate(callback?: () => void): void;
      render(): React.ReactNode;
      setState(state: any, callback?: () => void): void;
  }

  interface TextInput {
      props: any;
      state: any;
      context: any;
      refs: any;
      forceUpdate(callback?: () => void): void;
      render(): React.ReactNode;
      setState(state: any, callback?: () => void): void;
  }

  interface ImageBackground {
      props: any;
      state: any;
      context: any;
      refs: any;
      forceUpdate(callback?: () => void): void;
      render(): React.ReactNode;
      setState(state: any, callback?: () => void): void;
  }

  namespace Animated {
      interface AnimatedComponent<T> {
          new (props: any): React.Component<any, any>;
          props: any;
          state: any;
          context: any;
          refs: any;
          forceUpdate(callback?: () => void): void;
          render(): React.ReactNode;
          setState(state: any, callback?: () => void): void;
      }
  }
}

declare module 'expo-blur' {
    interface BlurView {
        props: any;
        state: any;
        context: any;
        refs: any;
        forceUpdate(callback?: () => void): void;
        render(): React.ReactNode;
        setState(state: any, callback?: () => void): void;
    }
}

