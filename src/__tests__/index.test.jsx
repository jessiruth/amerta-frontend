import ReactDOM from 'react-dom/client';
import { React, act } from 'react';
import App from '../App';

jest.mock('../reportWebVitals', () => jest.fn());

beforeAll(() => {
  jest.useFakeTimers();
});

test('renders App component without crashing', () => {
  const root = document.createElement('div');
  const reactRoot = ReactDOM.createRoot(root);

  act(() => {
    reactRoot.render(<App />);
  });

  act(() => {
    reactRoot.unmount();
  });
});