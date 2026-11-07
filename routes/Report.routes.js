
const express = require("express");
const router = express.Router();
const Report = require("../models/Report");


router.post("/", async (req, res) => {
    try {
        const report = await Report.create(req.body);
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/", async (req, res) => {
    const reports = await Report.find()
        .populate("reporter")
        .populate("targetId");

    res.json(reports);
});


router.get("/:id", async (req, res) => {
    const report = await Report.findById(req.params.id);
    res.json(report);
});


router.put("/:id", async (req, res) => {
    const report = await Report.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(report);
});


router.delete("/:id", async (req, res) => {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted successfully" });
});

module.exports = router;
