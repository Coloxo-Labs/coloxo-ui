import { describe, expect, it } from "vitest";
import { act, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";
import { AvatarLabelGroup } from "./AvatarLabelGroup";
import { AvatarProfilePhoto } from "./AvatarProfilePhoto";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Avatar", () => {
  it("renders initials", () => {
    renderWithTheme(<Avatar initials="Ada Lovelace" />);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("renders status", () => {
    renderWithTheme(<Avatar initials="Ada" status="online" />);
    expect(screen.getByLabelText("online")).toBeInTheDocument();
  });

  it("renders verified badge with Coloxo brand treatment", () => {
    renderWithTheme(<Avatar initials="OR" verified />);
    expect(screen.getByLabelText("Verified")).toBeInTheDocument();
  });

  it("renders border and count", () => {
    renderWithTheme(<Avatar initials="OR" border count={3} />);
    expect(screen.getByLabelText("Count 3")).toBeInTheDocument();
  });

  it("falls back when image fails", async () => {
    const { findByText } = renderWithTheme(
      <Avatar src="https://invalid.example/x.png" initials="OR" alt="Olivia" />,
    );
    const img = screen.getByRole("img", { name: "Olivia" });
    await act(async () => {
      img.dispatchEvent(new Event("error"));
    });
    expect(await findByText("OR")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<Avatar initials="Ada Lovelace" alt="Ada Lovelace" />);
    await expectNoA11yViolations(container);
  });
});

describe("AvatarLabelGroup", () => {
  it("renders title and subtitle", () => {
    renderWithTheme(
      <AvatarLabelGroup
        initials="OR"
        title="Olivia Rhye"
        subtitle="olivia@untitledui.com"
        size="md"
      />,
    );
    expect(screen.getByText("Olivia Rhye")).toBeInTheDocument();
    expect(screen.getByText("olivia@untitledui.com")).toBeInTheDocument();
  });
});

describe("AvatarProfilePhoto", () => {
  it("renders initials profile photo", () => {
    renderWithTheme(<AvatarProfilePhoto initials="OR" size="md" />);
    expect(screen.getByText("OR")).toBeInTheDocument();
  });

  it("renders verified badge", () => {
    renderWithTheme(<AvatarProfilePhoto initials="OR" verified />);
    expect(screen.getByLabelText("Verified")).toBeInTheDocument();
  });

  it("renders company badge over status when both are set", () => {
    renderWithTheme(
      <AvatarProfilePhoto
        initials="OR"
        status="online"
        badge={<span data-testid="company-badge">C</span>}
      />,
    );
    expect(screen.getByTestId("company-badge")).toBeInTheDocument();
    expect(screen.queryByLabelText("online")).not.toBeInTheDocument();
  });

  it("renders verified over status when both are set", () => {
    renderWithTheme(<AvatarProfilePhoto initials="OR" status="online" verified />);
    expect(screen.getByLabelText("Verified")).toBeInTheDocument();
    expect(screen.queryByLabelText("online")).not.toBeInTheDocument();
  });
});
