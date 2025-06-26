// API Configuration
const API_BASE_URL = "http://localhost:5000/api"

// Global state
let currentUser = null
let authToken = null

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
})

function initializeApp() {
  // Check if user is already logged in
  const token = localStorage.getItem("authToken")
  const user = localStorage.getItem("currentUser")

  if (token && user) {
    authToken = token
    currentUser = JSON.parse(user)
    showDashboard()
  } else {
    showAuthSection()
  }
}

function setupEventListeners() {
  // Auth forms
  document.getElementById("loginForm").addEventListener("submit", handleLogin)
  document.getElementById("registerForm").addEventListener("submit", handleRegister)

  // Role change in register form
  document.getElementById("registerRole").addEventListener("change", function () {
    const role = this.value
    const studentIdGroup = document.getElementById("studentIdGroup")
    const teacherIdGroup = document.getElementById("teacherIdGroup")

    studentIdGroup.style.display = role === "student" ? "block" : "none"
    teacherIdGroup.style.display = role === "teacher" ? "block" : "none"
  })

  // Modal forms
  document.getElementById("addUserForm").addEventListener("submit", handleAddUser)
  document.getElementById("addSubjectForm").addEventListener("submit", handleAddSubject)
  document.getElementById("addGradeForm").addEventListener("submit", handleAddGrade)
  document.getElementById("assignMarksForm").addEventListener("submit", handleAssignMarks)
}

// Authentication functions
async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  try {
    showLoading(true)

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      authToken = data.token
      currentUser = data.user

      localStorage.setItem("authToken", authToken)
      localStorage.setItem("currentUser", JSON.stringify(currentUser))

      showToast("Login successful!", "success")
      showDashboard()
    } else {
      showToast(data.message || "Login failed", "error")
    }
  } catch (error) {
    console.error("Login error:", error)
    showToast("Network error. Please try again.", "error")
  } finally {
    showLoading(false)
  }
}

async function handleRegister(e) {
  e.preventDefault()

  const formData = {
    name: document.getElementById("registerName").value,
    email: document.getElementById("registerEmail").value,
    password: document.getElementById("registerPassword").value,
    role: document.getElementById("registerRole").value,
  }

  if (formData.role === "student") {
    formData.studentId = document.getElementById("studentId").value
  } else if (formData.role === "teacher") {
    formData.teacherId = document.getElementById("teacherId").value
  }

  try {
    showLoading(true)

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (response.ok) {
      authToken = data.token
      currentUser = data.user

      localStorage.setItem("authToken", authToken)
      localStorage.setItem("currentUser", JSON.stringify(currentUser))

      showToast("Registration successful!", "success")
      showDashboard()
    } else {
      showToast(data.message || "Registration failed", "error")
    }
  } catch (error) {
    console.error("Registration error:", error)
    showToast("Network error. Please try again.", "error")
  } finally {
    showLoading(false)
  }
}

function logout() {
  localStorage.removeItem("authToken")
  localStorage.removeItem("currentUser")
  authToken = null
  currentUser = null
  showAuthSection()
  showToast("Logged out successfully", "success")
}

// UI Navigation functions
function showAuthSection() {
  document.getElementById("auth-section").classList.remove("hidden")
  document.getElementById("dashboard-section").classList.add("hidden")
}

function showDashboard() {
  document.getElementById("auth-section").classList.add("hidden")
  document.getElementById("dashboard-section").classList.remove("hidden")

  // Set user name
  document.getElementById("userName").textContent = `Welcome, ${currentUser.name}`

  // Show appropriate menu based on role
  showRoleBasedMenu()

  // Load initial data
  loadDashboardData()
}

function showRoleBasedMenu() {
  // Hide all menus first
  document.getElementById("admin-menu").classList.add("hidden")
  document.getElementById("teacher-menu").classList.add("hidden")
  document.getElementById("student-menu").classList.add("hidden")

  // Show appropriate menu
  if (currentUser.role === "admin") {
    document.getElementById("admin-menu").classList.remove("hidden")
    showSection("dashboard")
  } else if (currentUser.role === "teacher") {
    document.getElementById("teacher-menu").classList.remove("hidden")
    showSection("teacher-dashboard")
  } else if (currentUser.role === "student") {
    document.getElementById("student-menu").classList.remove("hidden")
    showSection("student-dashboard")
  }
}

function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll(".content-section")
  sections.forEach((section) => section.classList.remove("active"))

  // Show selected section
  document.getElementById(sectionId).classList.add("active")

  // Update active menu item
  const menuLinks = document.querySelectorAll(".menu-list a")
  menuLinks.forEach((link) => link.classList.remove("active"))

  // Load section-specific data
  loadSectionData(sectionId)
}

async function loadDashboardData() {
  if (currentUser.role === "admin") {
    await loadAdminStats()
    await loadUsers()
    await loadSubjects()
    await loadGrades()
    await loadMarks()
  } else if (currentUser.role === "teacher") {
    await loadTeacherStats()
    await loadTeacherData()
  } else if (currentUser.role === "student") {
    await loadStudentStats()
    await loadStudentMarks()
    await loadStudentProfile()
  }
}

async function loadSectionData(sectionId) {
  switch (sectionId) {
    case "users":
      await loadUsers()
      break
    case "subjects":
      await loadSubjects()
      break
    case "grades":
      await loadGrades()
      break
    case "marks":
      await loadMarks()
      break
    case "assign-marks":
      await loadAssignMarksData()
      break
    case "view-students":
      await loadTeacherStudents()
      break
    case "teacher-marks":
      await loadTeacherMarks()
      break
    case "my-marks":
      await loadStudentMarks()
      break
    case "my-profile":
      await loadStudentProfile()
      break
  }
}

// API Helper function
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "API request failed")
    }

    return data
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Admin functions
async function loadAdminStats() {
  try {
    const [users, subjects] = await Promise.all([apiCall("/users"), apiCall("/subjects")])

    const teachers = users.filter((user) => user.role === "teacher")
    const students = users.filter((user) => user.role === "student")

    document.getElementById("totalUsers").textContent = users.length
    document.getElementById("totalTeachers").textContent = teachers.length
    document.getElementById("totalStudents").textContent = students.length
    document.getElementById("totalSubjects").textContent = subjects.length
  } catch (error) {
    showToast("Failed to load admin statistics", "error")
  }
}

async function loadUsers() {
  try {
    const users = await apiCall("/users")
    const tbody = document.querySelector("#usersTable tbody")

    tbody.innerHTML = users
      .map(
        (user) => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge badge-${user.role}">${user.role}</span></td>
                <td>${user.studentId || user.teacherId || "-"}</td>
                <td>
                    <button onclick="editUser('${user._id}')" class="btn btn-sm btn-outline">Edit</button>
                    <button onclick="deleteUser('${user._id}')" class="btn btn-sm btn-danger">Delete</button>
                </td>
            </tr>
        `,
      )
      .join("")
  } catch (error) {
    showToast("Failed to load users", "error")
  }
}

async function loadSubjects() {
  try {
    const subjects = await apiCall("/subjects")
    const tbody = document.querySelector("#subjectsTable tbody")

    tbody.innerHTML = subjects
      .map(
        (subject) => `
            <tr>
                <td>${subject.name}</td>
                <td>${subject.code}</td>
                <td>${subject.description || "-"}</td>
                <td>${subject.teacher ? subject.teacher.name : "Not assigned"}</td>
                <td>
                    <button onclick="editSubject('${subject._id}')" class="btn btn-sm btn-outline">Edit</button>
                    <button onclick="deleteSubject('${subject._id}')" class="btn btn-sm btn-danger">Delete</button>
                </td>
            </tr>
        `,
      )
      .join("")
  } catch (error) {
    showToast("Failed to load subjects", "error")
  }
}

async function loadGrades() {
  try {
    const grades = await apiCall("/grades")
    const tbody = document.querySelector("#gradesTable tbody")

    tbody.innerHTML = grades
      .map(
        (grade) => `
            <tr>
                <td>${grade.name}</td>
                <td>${grade.level}</td>
                <td>${grade.section}</td>
                <td>${grade.students ? grade.students.length : 0}</td>
                <td>${grade.classTeacher ? grade.classTeacher.name : "Not assigned"}</td>
                <td>
                    <button onclick="editGrade('${grade._id}')" class="btn btn-sm btn-outline">Edit</button>
                    <button onclick="deleteGrade('${grade._id}')" class="btn btn-sm btn-danger">Delete</button>
                </td>
            </tr>
        `,
      )
      .join("")
  } catch (error) {
    showToast("Failed to load grades", "error")
  }
}

async function loadMarks() {
  try {
    const marks = await apiCall("/marks")
    const tbody = document.querySelector("#marksTable tbody")

    tbody.innerHTML = marks
      .map(
        (mark) => `
            <tr>
                <td>${mark.student ? mark.student.name : "Unknown"}</td>
                <td>${mark.subject ? mark.subject.name : "Unknown"}</td>
                <td>${mark.grade ? mark.grade.name : "Unknown"}</td>
                <td>${mark.marks}</td>
                <td>${mark.examType}</td>
                <td>${new Date(mark.examDate).toLocaleDateString()}</td>
                <td>${mark.teacher ? mark.teacher.name : "Unknown"}</td>
                <td>
                    <button onclick="editMark('${mark._id}')" class="btn btn-sm btn-outline">Edit</button>
                    <button onclick="deleteMark('${mark._id}')" class="btn btn-sm btn-danger">Delete</button>
                </td>
            </tr>
        `,
      )
      .join("")
  } catch (error) {
    showToast("Failed to load marks", "error")
  }
}

// Teacher functions
async function loadTeacherStats() {
  try {
    const [students, marks] = await Promise.all([apiCall("/users/role/students"), apiCall("/marks")])

    // This is simplified - in a real app, you'd filter by teacher's assigned students/subjects
    document.getElementById("teacherStudents").textContent = students.length
    document.getElementById("teacherSubjects").textContent = "0" // Would be calculated based on assignments
    document.getElementById("teacherMarks").textContent = marks.length
  } catch (error) {
    showToast("Failed to load teacher statistics", "error")
  }
}

async function loadTeacherData() {
  await loadAssignMarksData()
  await loadTeacherStudents()
  await loadTeacherMarks()
}

async function loadAssignMarksData() {
  try {
    const [students, subjects, grades] = await Promise.all([
      apiCall("/users/role/students"),
      apiCall("/subjects"),
      apiCall("/grades"),
    ])

    // Populate dropdowns
    populateSelect("markStudent", students, "name", "_id")
    populateSelect("markSubject", subjects, "name", "_id")
    populateSelect("markGrade", grades, "name", "_id")
  } catch (error) {
    showToast("Failed to load assignment data", "error")
  }
}

async function loadTeacherStudents() {
  try {
    const students = await apiCall("/users/role/students")
    const tbody = document.querySelector("#teacherStudentsTable tbody")

    tbody.innerHTML = students
      .map(
        (student) => `
            <tr>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.studentId || "-"}</td>
                <td>${student.enrolledGrade ? student.enrolledGrade.name : "Not assigned"}</td>
                <td>
                    <button onclick="viewStudentMarks('${student._id}')" class="btn btn-sm btn-outline">View Marks</button>
                </td>
            </tr>
        `,
      )
      .join("")
  } catch (error) {
    showToast("Failed to load students", "error")
  }
}

async function loadTeacherMarks() {
  try {
    const marks = await apiCall("/marks")
    const tbody = document.querySelector("#teacherMarksTable tbody")

    tbody.innerHTML = marks
      .map(
        (mark) => `
            <tr>
                <td>${mark.student ? mark.student.name : "Unknown"}</td>
                <td>${mark.subject ? mark.subject.name : "Unknown"}</td>
                <td>${mark.marks}</td>
                <td>${mark.examType}</td>
                <td>${new Date(mark.examDate).toLocaleDateString()}</td>
                <td>
                    <button onclick="editMark('${mark._id}')" class="btn btn-sm btn-outline">Edit</button>
                    <button onclick="deleteMark('${mark._id}')" class="btn btn-sm btn-danger">Delete</button>
                </td>
            </tr>
        `,
      )
      .join("")
  } catch (error) {
    showToast("Failed to load teacher marks", "error")
  }
}

// Student functions
async function loadStudentStats() {
  try {
    const marks = await apiCall(`/marks/student/${currentUser.id}`)

    if (marks.length > 0) {
      const average = marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length
      const highest = Math.max(...marks.map((mark) => mark.marks))
      const subjects = new Set(marks.map((mark) => mark.subject._id)).size

      document.getElementById("studentAverage").textContent = average.toFixed(1)
      document.getElementById("studentSubjects").textContent = subjects
      document.getElementById("studentHighest").textContent = highest
    }
  } catch (error) {
    showToast("Failed to load student statistics", "error")
  }
}

async function loadStudentMarks() {
  try {
    const marks = await apiCall(`/marks/student/${currentUser.id}`)
    const tbody = document.querySelector("#studentMarksTable tbody")

    tbody.innerHTML = marks
      .map(
        (mark) => `
            <tr>
                <td>${mark.subject ? mark.subject.name : "Unknown"}</td>
                <td>${mark.marks}</td>
                <td>${mark.examType}</td>
                <td>${new Date(mark.examDate).toLocaleDateString()}</td>
                <td>${mark.teacher ? mark.teacher.name : "Unknown"}</td>
                <td>${mark.remarks || "-"}</td>
            </tr>
        `,
      )
      .join("")
  } catch (error) {
    showToast("Failed to load student marks", "error")
  }
}

async function loadStudentProfile() {
  try {
    const user = await apiCall(`/users/${currentUser.id}`)

    document.getElementById("profileName").textContent = user.name
    document.getElementById("profileEmail").textContent = user.email
    document.getElementById("profileRole").textContent = user.role
    document.getElementById("profileStudentId").textContent = user.studentId || "-"
    document.getElementById("profileGrade").textContent = user.enrolledGrade ? user.enrolledGrade.name : "-"
    document.getElementById("profileJoinDate").textContent = new Date(user.createdAt).toLocaleDateString()
  } catch (error) {
    showToast("Failed to load profile", "error")
  }
}

// Form handlers
async function handleAddUser(e) {
  e.preventDefault()

  const formData = {
    name: document.getElementById("newUserName").value,
    email: document.getElementById("newUserEmail").value,
    password: document.getElementById("newUserPassword").value,
    role: document.getElementById("newUserRole").value,
  }

  try {
    await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    })

    showToast("User added successfully!", "success")
    closeModal()
    loadUsers()
    document.getElementById("addUserForm").reset()
  } catch (error) {
    showToast("Failed to add user", "error")
  }
}

async function handleAddSubject(e) {
  e.preventDefault()

  const formData = {
    name: document.getElementById("newSubjectName").value,
    code: document.getElementById("newSubjectCode").value,
    description: document.getElementById("newSubjectDescription").value,
    teacher: document.getElementById("newSubjectTeacher").value || undefined,
  }

  try {
    await apiCall("/subjects", {
      method: "POST",
      body: JSON.stringify(formData),
    })

    showToast("Subject added successfully!", "success")
    closeModal()
    loadSubjects()
    document.getElementById("addSubjectForm").reset()
  } catch (error) {
    showToast("Failed to add subject", "error")
  }
}

async function handleAddGrade(e) {
  e.preventDefault()

  const formData = {
    name: document.getElementById("newGradeName").value,
    level: Number.parseInt(document.getElementById("newGradeLevel").value),
    section: document.getElementById("newGradeSection").value,
    classTeacher: document.getElementById("newGradeTeacher").value || undefined,
  }

  try {
    await apiCall("/grades", {
      method: "POST",
      body: JSON.stringify(formData),
    })

    showToast("Grade added successfully!", "success")
    closeModal()
    loadGrades()
    document.getElementById("addGradeForm").reset()
  } catch (error) {
    showToast("Failed to add grade", "error")
  }
}

async function handleAssignMarks(e) {
  e.preventDefault()

  const formData = {
    student: document.getElementById("markStudent").value,
    subject: document.getElementById("markSubject").value,
    grade: document.getElementById("markGrade").value,
    marks: Number.parseFloat(document.getElementById("markValue").value),
    examType: document.getElementById("examType").value,
    examDate: document.getElementById("examDate").value,
    remarks: document.getElementById("markRemarks").value || undefined,
  }

  try {
    await apiCall("/marks", {
      method: "POST",
      body: JSON.stringify(formData),
    })

    showToast("Marks assigned successfully!", "success")
    document.getElementById("assignMarksForm").reset()
    loadTeacherMarks()
  } catch (error) {
    showToast("Failed to assign marks", "error")
  }
}

// Modal functions
function showAddUserModal() {
  document.getElementById("modal-overlay").classList.remove("hidden")
  document.getElementById("addUserModal").style.display = "block"
  document.getElementById("addSubjectModal").style.display = "none"
  document.getElementById("addGradeModal").style.display = "none"
}

async function showAddSubjectModal() {
  // Load teachers for dropdown
  try {
    const teachers = await apiCall("/users/role/teachers")
    populateSelect("newSubjectTeacher", teachers, "name", "_id")
  } catch (error) {
    console.error("Failed to load teachers")
  }

  document.getElementById("modal-overlay").classList.remove("hidden")
  document.getElementById("addUserModal").style.display = "none"
  document.getElementById("addSubjectModal").style.display = "block"
  document.getElementById("addGradeModal").style.display = "none"
}

async function showAddGradeModal() {
  // Load teachers for dropdown
  try {
    const teachers = await apiCall("/users/role/teachers")
    populateSelect("newGradeTeacher", teachers, "name", "_id")
  } catch (error) {
    console.error("Failed to load teachers")
  }

  document.getElementById("modal-overlay").classList.remove("hidden")
  document.getElementById("addUserModal").style.display = "none"
  document.getElementById("addSubjectModal").style.display = "none"
  document.getElementById("addGradeModal").style.display = "block"
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden")
}

// Utility functions
function showLogin() {
  document.getElementById("login-form").classList.add("active")
  document.getElementById("register-form").classList.remove("active")
}

function showRegister() {
  document.getElementById("login-form").classList.remove("active")
  document.getElementById("register-form").classList.add("active")
}

function showLoading(show) {
  const loading = document.getElementById("loading")
  if (show) {
    loading.classList.remove("hidden")
  } else {
    loading.classList.add("hidden")
  }
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container")
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.textContent = message

  container.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 5000)
}

function populateSelect(selectId, options, textField, valueField) {
  const select = document.getElementById(selectId)
  const currentOptions = select.querySelectorAll('option:not([value=""])')
  currentOptions.forEach((option) => option.remove())

  options.forEach((option) => {
    const optionElement = document.createElement("option")
    optionElement.value = option[valueField]
    optionElement.textContent = option[textField]
    select.appendChild(optionElement)
  })
}

function filterUsers() {
  const filter = document.getElementById("userRoleFilter").value
  const rows = document.querySelectorAll("#usersTable tbody tr")

  rows.forEach((row) => {
    const roleCell = row.cells[2].textContent.toLowerCase()
    if (!filter || roleCell.includes(filter)) {
      row.style.display = ""
    } else {
      row.style.display = "none"
    }
  })
}

// CRUD operations
async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return

  try {
    await apiCall(`/users/${userId}`, { method: "DELETE" })
    showToast("User deleted successfully!", "success")
    loadUsers()
  } catch (error) {
    showToast("Failed to delete user", "error")
  }
}

async function deleteSubject(subjectId) {
  if (!confirm("Are you sure you want to delete this subject?")) return

  try {
    await apiCall(`/subjects/${subjectId}`, { method: "DELETE" })
    showToast("Subject deleted successfully!", "success")
    loadSubjects()
  } catch (error) {
    showToast("Failed to delete subject", "error")
  }
}

async function deleteGrade(gradeId) {
  if (!confirm("Are you sure you want to delete this grade?")) return

  try {
    await apiCall(`/grades/${gradeId}`, { method: "DELETE" })
    showToast("Grade deleted successfully!", "success")
    loadGrades()
  } catch (error) {
    showToast("Failed to delete grade", "error")
  }
}

async function deleteMark(markId) {
  if (!confirm("Are you sure you want to delete this mark?")) return

  try {
    await apiCall(`/marks/${markId}`, { method: "DELETE" })
    showToast("Mark deleted successfully!", "success")

    // Reload appropriate marks table based on current user role
    if (currentUser.role === "admin") {
      loadMarks()
    } else if (currentUser.role === "teacher") {
      loadTeacherMarks()
    }
  } catch (error) {
    showToast("Failed to delete mark", "error")
  }
}

// Placeholder functions for edit operations
function editUser(userId) {
  showToast("Edit user functionality would be implemented here", "warning")
}

function editSubject(subjectId) {
  showToast("Edit subject functionality would be implemented here", "warning")
}

function editGrade(gradeId) {
  showToast("Edit grade functionality would be implemented here", "warning")
}

function editMark(markId) {
  showToast("Edit mark functionality would be implemented here", "warning")
}

function viewStudentMarks(studentId) {
  showToast("View student marks functionality would be implemented here", "warning")
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  if (e.target.id === "modal-overlay") {
    closeModal()
  }
})

// Handle menu item clicks
document.addEventListener("click", (e) => {
  if (e.target.closest(".menu-list a")) {
    const menuLinks = document.querySelectorAll(".menu-list a")
    menuLinks.forEach((link) => link.classList.remove("active"))
    e.target.closest("a").classList.add("active")
  }
})
