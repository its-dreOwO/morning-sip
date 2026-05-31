import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MailView } from "./MailWidget";

describe("MailView", () => {
  it("renders unread count and urgent count", () => {
    render(
      <MailView
        state="ready"
        expanded={false}
        data={{ unread: 12, urgent: 2, senders: ["Sam", "GitHub"] }}
      />
    );
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/2 urgent/)).toBeInTheDocument();
  });
});
