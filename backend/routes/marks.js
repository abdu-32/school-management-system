const express = require("express")
const { body, validationResult } = require("express-validator")
const Mark = require("../models/Mark")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get marks (role-based access)
router.get("/", auth, async (req, res) => {
  try {
    const filter = {}

    if (req.user.role === "student") {
      filter.student = req.user._id
    } else if (req.user.role === "teacher") {
      filter.teacher = req.user._id
    }
    // Admin can see all marks

    const marks = await Mark.find(filter)
      .populate("student", "name email studentId")
      .populate("subject", "name code")
      .populate("grade", "name level section")
      .populate("teacher", "name email")
      .sort({ examDate: -1 })

    res.json(marks)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get marks by student ID
router.get("/student/:studentId", auth, async (req, res) => {
  try {
    // Students can only view their own marks
    if (req.user.role === "student" && req.user._id.toString() !== req.params.studentId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const marks = await Mark.find({ student: req.params.studentId })
      .populate("student", "name email studentId")
      .populate("subject", "name code")
      .populate("grade", "name level section")
      .populate("teacher", "name email")
      .sort({ examDate: -1 })

    res.json(marks)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create mark (Teacher and Admin)
router.post(
  "/",
  auth,
  authorize("teacher", "admin"),
  [
    body("student").isMongoId().withMessage("Valid student ID is required"),
    body("subject").isMongoId().withMessage("Valid subject ID is required"),
    body("grade").isMongoId().withMessage("Valid grade ID is required"),
    body("marks").isFloat({ min: 0, max: 100 }).withMessage("Marks must be between 0 and 100"),
    body("examType").isIn(["quiz", "midterm", "final", "assignment"]).withMessage("Invalid exam type"),
    body("examDate").isISO8601().withMessage("Valid exam date is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const markData = {
        ...req.body,
        teacher: req.user._id,
      }

      const mark = new Mark(markData)
      await mark.save()

      await mark.populate("student", "name email studentId")
      await mark.populate("subject", "name code")
      await mark.populate("grade", "name level section")
      await mark.populate("teacher", "name email")

      res.status(201).json(mark)
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Mark already exists for this student, subject, and exam" })
      }
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update mark (Teacher and Admin)
router.put(
  "/:id",
  auth,
  authorize("teacher", "admin"),
  [
    body("marks").optional().isFloat({ min: 0, max: 100 }),
    body("examType").optional().isIn(["quiz", "midterm", "final", "assignment"]),
    body("examDate").optional().isISO8601(),
    body("remarks").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const mark = await Mark.findById(req.params.id)

      if (!mark) {
        return res.status(404).json({ message: "Mark not found" })
      }

      // Teachers can only update their own marks
      if (req.user.role === "teacher" && mark.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" })
      }

      const updatedMark = await Mark.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate("student", "name email studentId")
        .populate("subject", "name code")
        .populate("grade", "name level section")
        .populate("teacher", "name email")

      res.json(updatedMark)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete mark (Teacher and Admin)
router.delete("/:id", auth, authorize("teacher", "admin"), async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id)

    if (!mark) {
      return res.status(404).json({ message: "Mark not found" })
    }

    // Teachers can only delete their own marks
    if (req.user.role === "teacher" && mark.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    await Mark.findByIdAndDelete(req.params.id)
    res.json({ message: "Mark deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
