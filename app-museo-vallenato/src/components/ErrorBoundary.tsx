import React from 'react';
import { View, Text } from 'react-native';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex:1, backgroundColor:'#121212', alignItems:'center', justifyContent:'center', padding:24 }}>
          <Text style={{ color:'#fff', fontSize:16, marginBottom:8 }}>Ocurrió un error</Text>
          <Text style={{ color:'#bbb' }}>{String(this.state.error)}</Text>
        </View>
      );
    }
    return this.props.children as any;
  }
}

export default ErrorBoundary;
