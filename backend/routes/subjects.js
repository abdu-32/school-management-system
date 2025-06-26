const express = require("express")
const { body, validationResult } = require("express-validator")
const Subject = require("../models/Subject")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all subjects
router.get("/", auth, async (req, res) => {
  try {
    const subjects = await Subject.find().populate("teacher", "name email").populate("grades", "name level section")

    res.json(subjects)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get subject by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate("teacher", "name email")
      .populate("grades", "name level section")

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" })
    }

    res.json(subject)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create subject (Admin only)
router.post(
  "/",
  auth,
  authorize("admin"),
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Subject name is required"),
    body("code").trim().isLength({ min: 2 }).withMessage("Subject code is required"),
    body("description").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const subject = new Subject(req.body)
      await subject.save()

      await subject.populate("teacher", "name email")
      await subject.populate("grades", "name level section")

      res.status(201).json(subject)
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Subject code already exists" })
      }
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update subject (Admin only)
router.put(
  "/:id",
  auth,
  authorize("admin"),
  [
    body("name").optional().trim().isLength({ min: 2 }),
    body("code").optional().trim().isLength({ min: 2 }),
    body("description").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate("teacher", "name email")
        .populate("grades", "name level section")

      if (!subject) {
        return res.status(404).json({ message: "Subject not found" })
      }

      res.json(subject)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete subject (Admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id)

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" })
    }

    res.json({ message: "Subject deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
