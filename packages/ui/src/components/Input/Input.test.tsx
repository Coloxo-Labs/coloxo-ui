import { MailIcon } from "../../icons";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";
import { InputGroup, InputPrefix } from "./InputGroup";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Input", () => {
  it("associates label with the control", () => {
    renderWithTheme(<Input label="Employee name" placeholder="Enter name" required />);
    expect(screen.getByLabelText(/Employee name/)).toBeRequired();
  });

  it("announces error state and shows invalid affordance", () => {
    renderWithTheme(
      <Input label="Employee name" error="Employee name is required" />,
    );
    const input = screen.getByLabelText(/Employee name/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Employee name is required");
  });

  it("supports hint alias and leading icon", () => {
    renderWithTheme(
      <Input
        label="Email"
        hint="Work email preferred"
        icon={<MailIcon />}
        placeholder="name@example.com"
      />,
    );
    expect(screen.getByText("Work email preferred")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@example.com")).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Input label="Password" type="password" defaultValue="secret" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
  });

  it("can be disabled", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Input label="Email" disabled />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeDisabled();
    await user.type(input, "a");
    expect(input).toHaveValue("");
  });

  it("renders InputGroup leading text via leadingText on child", () => {
    renderWithTheme(
      <InputGroup label="Website" leadingText="https://">
        <Input placeholder="www.example.com" />
      </InputGroup>,
    );
    expect(screen.getByText("https://")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("www.example.com")).toBeInTheDocument();
  });

  it("renders InputGroup addons", () => {
    renderWithTheme(
      <InputGroup
        label="Phone"
        leadingAddon={<InputPrefix position="leading">US</InputPrefix>}
      >
        <Input type="tel" placeholder="+1" />
      </InputGroup>,
    );
    expect(screen.getByText("US")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Input label="Email address" type="email" placeholder="name@example.com" required />,
    );
    await expectNoA11yViolations(container);
  });
});
