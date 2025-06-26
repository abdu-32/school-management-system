const express = require("express")
const { body, validationResult } = require("express-validator")
const Grade = require("../models/Grade")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all grades
router.get("/", auth, async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate("students", "name email studentId")
      .populate("subjects", "name code")
      .populate("classTeacher", "name email")

    res.json(grades)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get grade by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate("students", "name email studentId")
      .populate("subjects", "name code")
      .populate("classTeacher", "name email")

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" })
    }

    res.json(grade)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create grade (Admin only)
router.post(
  "/",
  auth,
  authorize("admin"),
  [
    body("name").trim().isLength({ min: 1 }).withMessage("Grade name is required"),
    body("level").isInt({ min: 1, max: 12 }).withMessage("Level must be between 1 and 12"),
    body("section").trim().isLength({ min: 1 }).withMessage("Section is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const grade = new Grade(req.body)
      await grade.save()

      await grade.populate("students", "name email studentId")
      await grade.populate("subjects", "name code")
      await grade.populate("classTeacher", "name email")

      res.status(201).json(grade)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update grade (Admin only)
router.put(
  "/:id",
  auth,
  authorize("admin"),
  [
    body("name").optional().trim().isLength({ min: 1 }),
    body("level").optional().isInt({ min: 1, max: 12 }),
    body("section").optional().trim().isLength({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate("students", "name email studentId")
        .populate("subjects", "name code")
        .populate("classTeacher", "name email")

      if (!grade) {
        return res.status(404).json({ message: "Grade not found" })
      }

      res.json(grade)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete grade (Admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id)

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" })
    }

    res.json({ message: "Grade deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add student to grade (Admin only)
router.post(
  "/:id/students",
  auth,
  authorize("admin"),
  [body("studentId").isMongoId().withMessage("Valid student ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const grade = await Grade.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { students: req.body.studentId } },
        { new: true },
      ).populate("students", "name email studentId")

      if (!grade) {
        return res.status(404).json({ message: "Grade not found" })
      }

      res.json(grade)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
