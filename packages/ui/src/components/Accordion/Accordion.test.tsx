import { useState } from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./Accordion";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

function Items() {
  return <>
    <AccordionItem id="first"><AccordionTrigger>First section</AccordionTrigger><AccordionContent>First content</AccordionContent></AccordionItem>
    <AccordionItem id="second"><AccordionTrigger>Second section</AccordionTrigger><AccordionContent>Second content</AccordionContent></AccordionItem>
    <AccordionItem id="disabled" isDisabled><AccordionTrigger>Disabled section</AccordionTrigger><AccordionContent>Disabled content</AccordionContent></AccordionItem>
  </>;
}

describe("Accordion", () => {
  it("opens a section with the keyboard and closes it when another opens", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Accordion><Items /></Accordion>);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "First section" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("First content")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Second section" }));
    expect(screen.getByRole("button", { name: "First section" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Second section" })).toHaveAttribute("aria-expanded", "true");
  });

  it("allows multiple open sections and supports collapsing", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Accordion allowsMultipleExpanded defaultExpandedKeys={["first"]}><Items /></Accordion>);
    await user.click(screen.getByRole("button", { name: "Second section" }));
    expect(screen.getByRole("button", { name: "First section" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Second section" })).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Second section" }));
    expect(screen.getByRole("button", { name: "Second section" })).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps disabled items closed", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Accordion><Items /></Accordion>);
    const trigger = screen.getByRole("button", { name: "Disabled section" });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports controlled expansion", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [keys, setKeys] = useState<Set<string | number>>(new Set());
      return <Accordion expandedKeys={keys} onExpandedChange={setKeys}><Items /></Accordion>;
    }
    renderWithTheme(<Controlled />);
    await user.click(screen.getByRole("button", { name: "First section" }));
    expect(screen.getByRole("button", { name: "First section" })).toHaveAttribute("aria-expanded", "true");
  });

  it("has accessible expanded panels and a hidden chevron", async () => {
    const { container } = renderWithTheme(<Accordion defaultExpandedKeys={["first"]}><Items /></Accordion>);
    expect(screen.getByRole("button", { name: "First section" }).querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    await expectNoA11yViolations(container);
  });
});
