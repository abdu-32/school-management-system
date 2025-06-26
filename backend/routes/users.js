const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all users (Admin only)
router.get("/", auth, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.query
    const filter = role ? { role } : {}

    const users = await User.find(filter)
      .select("-password")
      .populate("assignedSubjects")
      .populate("assignedGrades")
      .populate("enrolledGrade")

    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("assignedSubjects")
      .populate("assignedGrades")
      .populate("enrolledGrade")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Students can only view their own profile
    if (req.user.role === "student" && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user (Admin only)
router.put(
  "/:id",
  auth,
  authorize("admin"),
  [
    body("name").optional().trim().isLength({ min: 2 }),
    body("email").optional().isEmail(),
    body("role").optional().isIn(["admin", "teacher", "student"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select(
        "-password",
      )

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      res.json(user)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete user (Admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get teachers (Admin only)
router.get("/role/teachers", auth, authorize("admin"), async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("-password")
      .populate("assignedSubjects")
      .populate("assignedGrades")

    res.json(teachers)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get students (Admin and Teacher)
router.get("/role/students", auth, authorize("admin", "teacher"), async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password").populate("enrolledGrade")

    res.json(students)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
