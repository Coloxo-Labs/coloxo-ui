import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Card, CardActionArea, CardActions, CardContent, CardHeader, CardMedia } from "./Card";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Card", () => {
  it("renders title, body, and footer (simple API)", () => {
    renderWithTheme(
      <Card title="Payroll" description="March cycle" footer="Updated today">
        Body
      </Card>,
    );
    expect(screen.getByText("Payroll")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Updated today")).toBeInTheDocument();
  });

  it("applies visual style variants", () => {
    const { container, rerender } = renderWithTheme(<Card variant="elevated">Elevated</Card>);
    expect(container.querySelector('[data-variant="elevated"]')).toBeTruthy();

    rerender(<Card variant="aurora">Aurora</Card>);
    expect(container.querySelector('[data-variant="aurora"]')).toBeTruthy();

    rerender(<Card variant="brutalist">Brutal</Card>);
    expect(container.querySelector('[data-variant="brutalist"]')).toBeTruthy();
  });

  it("renders compound Header, Media, Content, and Actions", () => {
    renderWithTheme(
      <Card>
        <CardHeader title="Shrimp Paella" subheader="September 14, 2016" avatar={<span>A</span>} />
        <CardMedia image="https://picsum.photos/seed/card/640/360" height={140} alt="Paella" />
        <CardContent>
          <p>Recipe details</p>
        </CardContent>
        <CardActions>
          <button type="button">Share</button>
          <button type="button">Learn More</button>
        </CardActions>
      </Card>,
    );
    expect(screen.getByText("Shrimp Paella")).toBeInTheDocument();
    expect(screen.getByText("Recipe details")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Paella" })).toBeInTheDocument();
  });

  it("CardActionArea is interactive", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTheme(
      <Card>
        <CardActionArea onClick={onClick}>
          <CardContent>Open</CardContent>
        </CardActionArea>
      </Card>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(onClick).toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<Card title="Settings">Content</Card>);
    await expectNoA11yViolations(container);
  });
});
