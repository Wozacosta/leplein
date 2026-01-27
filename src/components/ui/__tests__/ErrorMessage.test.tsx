import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { ErrorMessage } from "../ErrorMessage";

describe("ErrorMessage", () => {
  it("renders the error message", () => {
    render(<ErrorMessage message="Something went wrong" />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorMessage message="Error occurred" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error occurred" onRetry={onRetry} />);

    expect(
      screen.getByRole("button", { name: /réessayer/i }),
    ).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error occurred" onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: /réessayer/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  describe("errorType", () => {
    it("shows network error message when errorType is network", () => {
      render(<ErrorMessage errorType="network" />);

      expect(screen.getByText(/connexion impossible/i)).toBeInTheDocument();
    });

    it("shows server error message when errorType is server", () => {
      render(<ErrorMessage errorType="server" />);

      expect(
        screen.getByText(/service est temporairement indisponible/i),
      ).toBeInTheDocument();
    });

    it("shows rate limit message when errorType is rate-limit", () => {
      render(<ErrorMessage errorType="rate-limit" />);

      expect(screen.getByText(/trop de requêtes/i)).toBeInTheDocument();
    });

    it("shows timeout message when errorType is timeout", () => {
      render(<ErrorMessage errorType="timeout" />);

      expect(screen.getByText(/pris trop de temps/i)).toBeInTheDocument();
    });

    it("shows unknown error message when errorType is unknown", () => {
      render(<ErrorMessage errorType="unknown" />);

      expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument();
    });

    it("uses custom message over errorType default", () => {
      render(<ErrorMessage message="Custom error" errorType="network" />);

      expect(screen.getByText("Custom error")).toBeInTheDocument();
      expect(
        screen.queryByText(/connexion impossible/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("showCacheNotice", () => {
    it("does not show cache notice by default", () => {
      render(<ErrorMessage message="Error" />);

      expect(
        screen.queryByText(/données potentiellement obsolètes/i),
      ).not.toBeInTheDocument();
    });

    it("shows cache notice when showCacheNotice is true", () => {
      render(<ErrorMessage message="Error" showCacheNotice />);

      expect(
        screen.getByText(/données potentiellement obsolètes/i),
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it('has role="alert" for screen readers', () => {
      render(<ErrorMessage message="Error" />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
