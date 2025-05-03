import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Choir Hymn Manager heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /Choir Hymn Manager/i });
  expect(heading).toBeInTheDocument();
});
