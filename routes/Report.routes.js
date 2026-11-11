
const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const Listing = require("../models/Listing");


router.post("/listings/:id/reports", async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found"
            });
        }

        const report = await Report.create({
            reporter: req.body.reporter,
            targetType: listing.type,
            targetId: listing._id,
            reason: req.body.reason,
            description: req.body.description,
            status: "open",
            createdAt: new Date()
        });

        res.status(201).json(report);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/admin/reports", async (req, res) => {
    try {
        const filter = {};

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const reports = await Report.find(filter)
            .populate("reporter")
            .populate("targetId");

        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/admin/reports/:id", async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate("reporter")
            .populate("targetId");

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put("/admin/reports/:id", async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.delete("/admin/reports/:id", async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);

        if (!report) {
            return res.status(404).json({
                message: "Report not found"
            });
        }

        res.json({ message: "Report deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
