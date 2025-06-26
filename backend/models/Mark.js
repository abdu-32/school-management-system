const mongoose = require("mongoose")

const markSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    examType: {
      type: String,
      enum: ["quiz", "midterm", "final", "assignment"],
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate marks for same student, subject, and exam
markSchema.index({ student: 1, subject: 1, examType: 1, examDate: 1 }, { unique: true })

module.exports = mongoose.model("Mark", markSchema)
