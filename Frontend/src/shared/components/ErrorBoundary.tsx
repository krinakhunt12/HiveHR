import React from 'react';
import ErrorPage from './ErrorPage';

type State = { hasError: boolean; error: Error | null };

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // You can log error to reporting service here
    // console.error('Unhandled error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage error={this.state.error} />;
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
