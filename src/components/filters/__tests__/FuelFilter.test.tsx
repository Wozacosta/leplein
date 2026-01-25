import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { FuelFilter } from "../FuelFilter";

describe("FuelFilter", () => {
  const mockOnFuelChange = vi.fn();

  beforeEach(() => {
    mockOnFuelChange.mockClear();
  });

  it("renders all 6 fuel types plus 'Tous' button", () => {
    render(
      <FuelFilter selectedFuelId={undefined} onFuelChange={mockOnFuelChange} />,
    );

    // Should have 7 buttons total (Tous + 6 fuel types)
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(7);

    // Verify "Tous" button exists
    expect(screen.getByText("Tous")).toBeInTheDocument();
  });

  it("displays fuel types with EU picto codes in format 'shortName (picto)'", () => {
    render(
      <FuelFilter selectedFuelId={undefined} onFuelChange={mockOnFuelChange} />,
    );

    // Verify each fuel type shows picto code
    expect(screen.getByText("Gazole (B7)")).toBeInTheDocument();
    expect(screen.getByText("SP95 (E5)")).toBeInTheDocument();
    expect(screen.getByText("E10 (E10)")).toBeInTheDocument();
    expect(screen.getByText("SP98 (E5)")).toBeInTheDocument();
    expect(screen.getByText("E85 (E85)")).toBeInTheDocument();
    expect(screen.getByText("GPLc (LPG)")).toBeInTheDocument();
  });

  it("calls onFuelChange with undefined when 'Tous' is clicked", () => {
    render(<FuelFilter selectedFuelId={1} onFuelChange={mockOnFuelChange} />);

    fireEvent.click(screen.getByText("Tous"));
    expect(mockOnFuelChange).toHaveBeenCalledWith(undefined);
  });

  it("calls onFuelChange with fuel id when fuel button is clicked", () => {
    render(
      <FuelFilter selectedFuelId={undefined} onFuelChange={mockOnFuelChange} />,
    );

    fireEvent.click(screen.getByText("SP95 (E5)"));
    expect(mockOnFuelChange).toHaveBeenCalledWith(2); // SP95 has id: 2
  });

  it("highlights selected fuel button", () => {
    render(<FuelFilter selectedFuelId={1} onFuelChange={mockOnFuelChange} />);

    const gazoleButton = screen.getByText("Gazole (B7)");
    expect(gazoleButton).toHaveClass("bg-blue-600", "text-white");

    const tousButton = screen.getByText("Tous");
    expect(tousButton).not.toHaveClass("bg-blue-600");
  });

  it("highlights 'Tous' button when no fuel is selected", () => {
    render(
      <FuelFilter selectedFuelId={undefined} onFuelChange={mockOnFuelChange} />,
    );

    const tousButton = screen.getByText("Tous");
    expect(tousButton).toHaveClass("bg-blue-600", "text-white");
  });

  it("has minimum 44px touch targets on all buttons", () => {
    render(
      <FuelFilter selectedFuelId={undefined} onFuelChange={mockOnFuelChange} />,
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveClass("min-h-[44px]");
    });
  });
});
