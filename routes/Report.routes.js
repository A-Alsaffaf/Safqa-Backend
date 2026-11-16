const express = require("express");
const router = express.Router();

const Report = require("../models/Report");
const Listing = require("../models/Listing");
const User = require("../models/User");

const verifyToken = require("../middleware/verifyToken");
const validateObjectId = require("../middleware/validateObjectId");

// Create Report
router.post(
    "/listings/:id/reports",
    verifyToken,
    validateObjectId,
    async (req, res) => {
        try {
            const { reason, description } = req.body;

            if (typeof reason !== "string" || typeof description !== "string" ||
                !reason.trim() || !description.trim()) {
                return res.status(400).json({ message: "Reason and description are required" });
            }

            const listing = await Listing.findById(req.params.id);

            if (!listing || listing.status === "Removed") {
                return res.status(404).json({
                    message: "Listing not found"
                });
            }

            const report = await Report.create({
                reporter: req.user._id,
                targetType: listing.type,
                targetId: listing._id,
                reason: reason.trim(),
                description: description.trim(),
                status: "open"
            });

            res.status(201).json(report);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Get All Reports — exclude deleted reports
router.get("/admin/reports", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || user.role !== "Admin") {
            return res.status(403).json({
                message: "Admin only"
            });
        }

        const filter = {
            isDeleted: { $ne: true }
        };

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const reports = await Report.find(filter)
            .populate("reporter", "username")
            .populate("targetId");

        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Report Details — exclude deleted reports
router.get(
    "/admin/reports/:id",
    verifyToken,
    validateObjectId,
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);

            if (!user || user.role !== "Admin") {
                return res.status(403).json({
                    message: "Admin only"
                });
            }

            const report = await Report.findById(req.params.id)
                .populate("reporter", "username")
                .populate({
                    path: "targetId",
                    populate: {
                        path: "seller",
                        select: "username"
                    }
                });

            if (!report || report.isDeleted) {
                return res.status(404).json({
                    message: "Report not found"
                });
            }

            res.json(report);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Update Report Status — only non-deleted reports
router.put(
    "/admin/reports/:id",
    verifyToken,
    validateObjectId,
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);

            if (!user || user.role !== "Admin") {
                return res.status(403).json({
                    message: "Admin only"
                });
            }

            if (!["open", "reviewed", "dismissed"].includes(req.body.status)) {
                return res.status(400).json({
                    message: "Invalid status"
                });
            }

            const report = await Report.findById(req.params.id);

            if (!report || report.isDeleted) {
                return res.status(404).json({
                    message: "Report not found"
                });
            }

            report.status = req.body.status;
            await report.save();

            res.json(report);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Soft Delete Report — keep the document in the database
router.delete(
    "/admin/reports/:id",
    verifyToken,
    validateObjectId,
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);

            if (!user || user.role !== "Admin") {
                return res.status(403).json({
                    message: "Admin only"
                });
            }

            const report = await Report.findById(req.params.id);

            if (!report || report.isDeleted) {
                return res.status(404).json({
                    message: "Report not found"
                });
            }

            report.isDeleted = true;
            report.deletedAt = new Date();
            await report.save();

            res.json({
                message: "Report deleted successfully"
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Delete Listing — Admin Only

router.delete(
    "/admin/listings/:id",
    verifyToken,
    validateObjectId,
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);

            if (!user || user.role !== "Admin") {
                return res.status(403).json({
                    message: "Admin only"
                });
            }

            // Retain the listing so reports and existing orders keep their details.
            const listing = await Listing.findById(req.params.id);

            if (!listing || listing.status === "Removed") {
                return res.status(404).json({
                    message: "Listing not found"
                });
            }

            listing.status = "Removed";
            await listing.save();

            res.json({
                message: "Listing deleted successfully"
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router;
