import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload, FileListItem, FileTypeIcon, type UploadFile } from "./FileUpload";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

const sampleFiles: UploadFile[] = [
  {
    id: "1",
    name: "Example dashboard screenshot.jpg",
    size: 720 * 1024,
    type: "jpg",
    progress: 50,
    status: "uploading",
  },
  {
    id: "2",
    name: "Tech design requirements_2.pdf",
    size: 720 * 1024,
    type: "pdf",
    progress: 100,
    status: "success",
  },
  {
    id: "3",
    name: "Tech design requirements.pdf",
    size: 1024 * 1024,
    type: "pdf",
    progress: 0,
    failed: true,
    status: "error",
  },
];

describe("FileUpload", () => {
  it("renders dropzone", () => {
    renderWithTheme(<FileUpload label="Offer letter" />);
    expect(screen.getByText("Click to upload")).toBeInTheDocument();
    expect(screen.getByText(/or drag and drop/)).toBeInTheDocument();
  });

  it("renders progress bar file list", () => {
    renderWithTheme(<FileUpload files={sampleFiles} progressVariant="bar" />);
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders progress fill file list", () => {
    renderWithTheme(<FileUpload files={sampleFiles} progressVariant="fill" />);
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Upload failed, please try again")).toBeInTheDocument();
  });

  it("calls onRetry for failed files", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderWithTheme(
      <FileUpload files={[sampleFiles[2]!]} progressVariant="bar" onRetry={onRetry} />,
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders FileTypeIcon labels", () => {
    const { container } = renderWithTheme(
      <>
        <FileTypeIcon type="invoice.pdf" />
        <FileTypeIcon type="clip.mp4" />
        <FileTypeIcon type="app.ts" />
      </>,
    );
    expect(container.textContent).toContain("PDF");
    expect(container.textContent).toContain("MP4");
    expect(container.textContent).toContain("TS");
  });

  it("renders FileListItem progress bar", () => {
    renderWithTheme(
      <ul>
        <FileListItem name="shot.jpg" size={1024} progress={40} type="jpg" />
      </ul>,
    );
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
  });

  it("renders image thumbnail when provided", () => {
    renderWithTheme(
      <ul>
        <FileListItem
          name="shot.jpg"
          size={1200}
          progress={60}
          type="jpg"
          thumbnailUrl="https://example.com/thumb.jpg"
        />
      </ul>,
    );
    const img = document.querySelector('img[src="https://example.com/thumb.jpg"]');
    expect(img).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <FileUpload label="Documents" hint="PDF up to 5 MB" maxSize={5 * 1024 * 1024} />,
    );
    await expectNoA11yViolations(container);
  });
});
