import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the calendar app shell", () => {
  render(<App />);

  expect(screen.getByText(/wall calendar/i)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /notes/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /previous month/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /next month/i })).toBeInTheDocument();
});
