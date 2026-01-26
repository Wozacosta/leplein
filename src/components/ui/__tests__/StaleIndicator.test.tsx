import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StaleIndicator } from "../StaleIndicator";

describe("StaleIndicator", () => {
  it("renders with warning clock icon and text", () => {
    render(<StaleIndicator />);
    expect(screen.getByText("Ancien")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<StaleIndicator />);
    const indicator = screen.getByLabelText("Données potentiellement obsolètes");
    expect(indicator).toBeInTheDocument();
  });

  it("has title tooltip explaining staleness", () => {
    render(<StaleIndicator />);
    const indicator = screen.getByLabelText("Données potentiellement obsolètes");
    expect(indicator).toHaveAttribute(
      "title",
      "Prix potentiellement obsolètes (plus de 48h)"
    );
  });

  it("applies muted orange styling", () => {
    render(<StaleIndicator />);
    const indicator = screen.getByLabelText("Données potentiellement obsolètes");
    expect(indicator).toHaveClass("text-orange-600");
    expect(indicator).toHaveClass("bg-orange-50");
  });

  it("renders clock icon with aria-hidden", () => {
    render(<StaleIndicator />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts custom className", () => {
    render(<StaleIndicator className="ml-2" />);
    const indicator = screen.getByLabelText("Données potentiellement obsolètes");
    expect(indicator).toHaveClass("ml-2");
  });
});
