import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";

describe("Dashboard navigation (Dispatch)", () => {
    // All possible tiles with their routes
    const stubRoutes = {
        "/board": "Manage Jobs",
        "/addjob": "Add Job Listing",
        "/fsb": "View Job Board",
        "/history": "View Changes",
        "/users-roles": "Manage Users",
        "/add-user": "Add User",
    };

    // Dispatch-only permissions (keys used by Dashboard)
    const allowedTiles = [
        "manageJobs",
        "addJobListing",
        "viewJobBoard",
        "viewChanges",
    ];

    // labels name
    const allowedLabels = [
        "Manage Jobs",
        "Add Job Listing",
        "View Job Board",
        "View Changes",
    ];

    const notAllowedLabels = ["Manage Users", "Add User"];

    test("renders allowed tiles for Dispatch and routes correctly; hides admin-only tiles", async () => {
        const user = userEvent.setup();

        // First render once to assert presence/absence
        render(
        <MemoryRouter initialEntries={["/"]}>
            <Routes>
            <Route path="/" element={<Dashboard allowedTiles={allowedTiles} />} />
            </Routes>
        </MemoryRouter>
        );

        // Allowed tiles are present (labels match Dashboard links)
        for (const label of allowedLabels) {
            expect(
                screen.getByRole("link", { name: new RegExp(label, "i") })
            ).toBeInTheDocument();
        }

        // Admin-only tiles are absent
        for (const label of notAllowedLabels) {
            expect(
                screen.queryByRole("link", { name: new RegExp(label, "i") })
            ).not.toBeInTheDocument();
        }

        cleanup(); // reset before routing checks

        // Now check routing ONLY for the allowed labels
        for (const [path, label] of Object.entries(stubRoutes)) {
            if (!allowedLabels.includes(label)) continue; // skip admin-only

            render(
                <MemoryRouter initialEntries={["/"]}>
                <Routes>
                    <Route
                    path="/"
                    element={<Dashboard allowedTiles={allowedTiles} />}
                    />
                    <Route path={path} element={<h1>{label}</h1>} />
                </Routes>
                </MemoryRouter>
            );

            const tile = screen.getByRole("link", { name: new RegExp(label, "i") });
            expect(tile).toBeInTheDocument();

            await user.click(tile);
            expect(
                await screen.findByRole("heading", { level: 1, name: label })
            ).toBeInTheDocument();

            cleanup();
        }
    });
});