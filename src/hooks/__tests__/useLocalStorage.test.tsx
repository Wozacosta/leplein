import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useLocalStorage } from "../useLocalStorage";

describe("useLocalStorage", () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    };
  })();

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial value when localStorage is empty", async () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value"),
    );

    // After hydration, should still be default value since localStorage is empty
    await waitFor(() => {
      expect(result.current[0]).toBe("default-value");
    });
  });

  it("returns stored value from localStorage after hydration", async () => {
    localStorageMock.setItem("test-key", JSON.stringify("stored-value"));

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value"),
    );

    // After hydration effect runs, should read from localStorage
    await waitFor(() => {
      expect(result.current[0]).toBe("stored-value");
    });
  });

  it("saves value to localStorage when setValue is called", async () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value"),
    );

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "test-key",
      JSON.stringify("new-value"),
    );
  });

  it("handles number values correctly", async () => {
    const { result } = renderHook(() => useLocalStorage("fuel-id", undefined));

    act(() => {
      result.current[1](1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "fuel-id",
      JSON.stringify(1),
    );
  });

  it("handles undefined values correctly", async () => {
    localStorageMock.setItem("test-key", JSON.stringify(5));

    const { result } = renderHook(() =>
      useLocalStorage<number | undefined>("test-key", undefined),
    );

    // Wait for hydration
    await waitFor(() => {
      expect(result.current[0]).toBe(5);
    });

    act(() => {
      result.current[1](undefined);
    });

    expect(result.current[0]).toBeUndefined();
  });

  it("handles object values correctly", async () => {
    const testObject = { name: "test", value: 42 };

    const { result } = renderHook(() =>
      useLocalStorage("test-key", { name: "", value: 0 }),
    );

    act(() => {
      result.current[1](testObject);
    });

    expect(result.current[0]).toEqual(testObject);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "test-key",
      JSON.stringify(testObject),
    );
  });

  it("returns initial value and clears corrupted JSON from localStorage", async () => {
    localStorageMock.setItem("test-key", "not-valid-json{{{");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value"),
    );

    // Wait for hydration effect to run and handle corrupted data
    await waitFor(() => {
      expect(result.current[0]).toBe("default-value");
    });
    expect(consoleSpy).toHaveBeenCalled();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("test-key");

    consoleSpy.mockRestore();
  });

  it("handles localStorage setItem errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value"),
    );

    act(() => {
      result.current[1]("new-value");
    });

    // State should still update even if localStorage fails
    expect(result.current[0]).toBe("new-value");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("uses same setValue reference across renders (useCallback)", async () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage("test-key", "default-value"),
    );

    const firstSetValue = result.current[1];
    rerender();
    const secondSetValue = result.current[1];

    expect(firstSetValue).toBe(secondSetValue);
  });

  it("reads correct value for lepleink-fuel key (integration)", async () => {
    // Simulating the actual use case from page.tsx
    localStorageMock.setItem("lepleink-fuel", JSON.stringify(1));

    const { result } = renderHook(() =>
      useLocalStorage<number | undefined>("lepleink-fuel", undefined),
    );

    // Wait for hydration
    await waitFor(() => {
      expect(result.current[0]).toBe(1); // Gazole fuel ID
    });
  });
});
