import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../test/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./InputOTP";

const slots = (
  <InputOTPGroup>
    {[0, 1, 2, 3].map((index) => (
      <InputOTPSlot key={index} index={index} />
    ))}
  </InputOTPGroup>
);

describe("InputOTP", () => {
  it("accepts digits, rejects letters, and signals completion", async () => {
    const user = userEvent.setup();
    const complete = vi.fn();
    renderWithTheme(
      <InputOTP
        maxLength={4}
        aria-label="Code"
        onComplete={complete}
        pushPasswordManagerStrategy="none"
      >
        {slots}
      </InputOTP>,
    );
    const input = screen.getByRole("textbox", { name: "Code" });
    await user.type(input, "a1234");
    expect(input).toHaveValue("1234");
    expect(complete).toHaveBeenCalledWith("1234");
    await user.keyboard("{Backspace}");
    expect(input).toHaveValue("123");
  });

  it("normalizes pasted codes and submits a single named form value", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <form aria-label="Verification">
        <InputOTP
          name="code"
          maxLength={4}
          aria-label="Code"
          pushPasswordManagerStrategy="none"
          pasteTransformer={(text) => text.replaceAll("-", "")}
        >
          {slots}
        </InputOTP>
      </form>,
    );
    await user.click(screen.getByRole("textbox", { name: "Code" }));
    await user.paste("12-34");
    expect(screen.getByRole("textbox")).toHaveValue("1234");
    expect(new FormData(screen.getByRole("form") as HTMLFormElement).get("code")).toBe("1234");
  });

  it("forwards the input ref and native accessibility attributes", () => {
    const ref = createRef<HTMLInputElement>();
    renderWithTheme(
      <>
        <label htmlFor="code">Verification code</label>
        <InputOTP
          ref={ref}
          id="code"
          maxLength={4}
          defaultValue="1234"
          disabled
          aria-invalid="true"
          aria-describedby="error"
        >
          {slots}
        </InputOTP>
        <p id="error">Code expired</p>
      </>,
    );
    const input = screen.getByLabelText("Verification code");
    expect(ref.current).toBe(input);
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAccessibleDescription("Code expired");
  });
});
