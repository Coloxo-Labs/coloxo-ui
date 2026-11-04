import { useCallback, useRef } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import { NotificationProvider, notification, dismissNotification } from "./Notification";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Notification", () => {
  beforeEach(() => {
    dismissNotification();
  });

  it("shows a success notification", async () => {
    renderWithTheme(
      <NotificationProvider>
        <button type="button" onClick={() => notification.success("Employee created successfully")}>
          Notify
        </button>
      </NotificationProvider>,
    );
    await act(async () => {
      screen.getByRole("button", { name: "Notify" }).click();
    });
    expect(await screen.findByText("Employee created successfully")).toBeInTheDocument();
  });

  it("animates by default and can disable animation", async () => {
    const { rerender } = renderWithTheme(
      <NotificationProvider>
        <button type="button" onClick={() => notification.info({ title: "Animated", duration: false })}>
          Notify
        </button>
      </NotificationProvider>,
    );
    await act(async () => {
      screen.getByRole("button", { name: "Notify" }).click();
    });
    expect(await screen.findByText("Animated")).toBeInTheDocument();
    // Portaled to document.body
    expect(document.querySelector("[data-animated='true']")).toBeTruthy();

    dismissNotification();
    rerender(
      <NotificationProvider animated={false}>
        <button
          type="button"
          onClick={() => notification.info({ title: "Static", duration: false, animated: false })}
        >
          NotifyStatic
        </button>
      </NotificationProvider>,
    );
    await act(async () => {
      screen.getByRole("button", { name: "NotifyStatic" }).click();
    });
    expect(await screen.findByText("Static")).toBeInTheDocument();
    expect(document.querySelector("[data-animated='false']")).toBeTruthy();
  });

  it("supports Ant Design config form with message alias and description", async () => {
    renderWithTheme(
      <NotificationProvider>
        <button
          type="button"
          onClick={() =>
            notification.info({
              message: "Synced",
              description: "Payroll mirror finished.",
            })
          }
        >
          Notify
        </button>
      </NotificationProvider>,
    );
    await act(async () => {
      screen.getByRole("button", { name: "Notify" }).click();
    });
    expect(await screen.findByText("Synced")).toBeInTheDocument();
    expect(await screen.findByText("Payroll mirror finished.")).toBeInTheDocument();
  });

  it("updates an existing notification by key", async () => {
    renderWithTheme(
      <NotificationProvider>
        <button
          type="button"
          onClick={() =>
            notification.open({
              key: "sync",
              title: "Syncing…",
              description: "Step 1",
            })
          }
        >
          Start
        </button>
        <button
          type="button"
          onClick={() =>
            notification.open({
              key: "sync",
              title: "Synced",
              description: "Done",
              variant: "success",
            })
          }
        >
          Finish
        </button>
      </NotificationProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "Start" }).click();
    });
    expect(await screen.findByText("Syncing…")).toBeInTheDocument();

    await act(async () => {
      screen.getByRole("button", { name: "Finish" }).click();
    });
    expect(await screen.findByText("Synced")).toBeInTheDocument();
    expect(screen.queryByText("Syncing…")).not.toBeInTheDocument();
    expect(await screen.findByText("Done")).toBeInTheDocument();
  });

  it("respects placement and destroy", async () => {
    renderWithTheme(
      <NotificationProvider placement="bottomLeft">
        <button
          type="button"
          onClick={() =>
            notification.warning({
              title: "Incomplete",
              placement: "bottomLeft",
              duration: false,
            })
          }
        >
          Warn
        </button>
        <button type="button" onClick={() => notification.destroy()}>
          Clear
        </button>
      </NotificationProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "Warn" }).click();
    });
    expect(await screen.findByText("Incomplete")).toBeInTheDocument();

    await act(async () => {
      screen.getByRole("button", { name: "Clear" }).click();
    });
    await waitFor(() => {
      expect(screen.queryByText("Incomplete")).not.toBeInTheDocument();
    });
  });

  it("renders avatar layout with image and dual actions", async () => {
    renderWithTheme(
      <NotificationProvider>
        <button
          type="button"
          onClick={() =>
            notification.avatar({
              title: "Phoenix Baker",
              description: "Hey Olivia — can you review the draft?",
              avatar: { src: "https://i.pravatar.cc/80?img=12", alt: "Phoenix Baker" },
              actions: (
                <>
                  <button type="button">Dismiss</button>
                  <button type="button">Reply</button>
                </>
              ),
            })
          }
        >
          Avatar
        </button>
      </NotificationProvider>,
    );
    await act(async () => {
      screen.getByRole("button", { name: "Avatar" }).click();
    });
    expect(await screen.findByText("Phoenix Baker")).toBeInTheDocument();
    expect(await screen.findByRole("img", { name: "Phoenix Baker" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reply" })).toBeInTheDocument();
  });

  it("renders image layout with thumbnail", async () => {
    renderWithTheme(
      <NotificationProvider>
        <button
          type="button"
          onClick={() =>
            notification.image({
              title: "New version available",
              description: "Version 2.4 includes performance improvements.",
              image: { src: "https://picsum.photos/seed/coloxo-notif/128/128", alt: "App preview" },
            })
          }
        >
          Image
        </button>
      </NotificationProvider>,
    );
    await act(async () => {
      screen.getByRole("button", { name: "Image" }).click();
    });
    expect(await screen.findByText("New version available")).toBeInTheDocument();
    expect(await screen.findByRole("img", { name: "App preview" })).toBeInTheDocument();
  });

  it("renders progress layout with content progress bar", async () => {
    renderWithTheme(
      <NotificationProvider>
        <button
          type="button"
          onClick={() =>
            notification.progress({
              title: "Uploading…",
              description: "dashboard-screenshot.png",
              progress: 42,
            })
          }
        >
          Progress
        </button>
      </NotificationProvider>,
    );
    await act(async () => {
      screen.getByRole("button", { name: "Progress" }).click();
    });
    expect(await screen.findByText("Uploading…")).toBeInTheDocument();
    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("renders actions and optional progress", async () => {
    const onUndo = vi.fn();
    renderWithTheme(
      <NotificationProvider>
        <button
          type="button"
          onClick={() =>
            notification.success({
              title: "Archived",
              showProgress: true,
              duration: 5000,
              actions: (
                <button type="button" onClick={onUndo}>
                  Undo
                </button>
              ),
            })
          }
        >
          Archive
        </button>
      </NotificationProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "Archive" }).click();
    });
    expect(await screen.findByText("Archived")).toBeInTheDocument();
    screen.getByRole("button", { name: "Undo" }).click();
    expect(onUndo).toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<NotificationProvider>Idle</NotificationProvider>);
    await expectNoA11yViolations(container);
  });

  it("portals into a custom container and suppresses the body host", async () => {
    function Demo() {
      const boxRef = useRef<HTMLDivElement>(null);
      const getContainer = useCallback(() => boxRef.current, []);
      return (
        <NotificationProvider>
          <div
            ref={boxRef}
            data-testid="toast-box"
            style={{ position: "relative", width: 320, height: 240 }}
          >
            <NotificationProvider getContainer={getContainer} top={8} bottom={8} />
            <button
              type="button"
              onClick={() =>
                notification.success({
                  title: "Contained toast",
                  placement: "topRight",
                  duration: false,
                })
              }
            >
              Show
            </button>
          </div>
        </NotificationProvider>
      );
    }

    renderWithTheme(<Demo />);

    await act(async () => {
      screen.getByRole("button", { name: "Show" }).click();
    });

    const toast = await screen.findByText("Contained toast");
    const box = screen.getByTestId("toast-box");
    expect(box.contains(toast)).toBe(true);
    expect(document.body.querySelectorAll("[data-notification-host]")).toHaveLength(1);
    expect(box.querySelector("[data-notification-host]")).toHaveAttribute("data-contained", "true");
  });
});
