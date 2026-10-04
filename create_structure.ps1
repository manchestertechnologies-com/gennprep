New-Item -ItemType Directory -Force -Path "server/config", "server/models", "server/routes", "server/controllers", "server/middleware", "server/utils" | Out-Null

$serverFiles = @(
    "server/index.js", "server/.env", "server/package.json",
    "server/config/db.js", "server/config/cloudinary.js",
    "server/models/User.js", "server/models/Exam.js", "server/models/Subject.js", "server/models/Chapter.js", "server/models/Topic.js", "server/models/Question.js", "server/models/Test.js", "server/models/TestAttempt.js", "server/models/Bookmark.js", "server/models/Progress.js", "server/models/Otp.js", "server/models/RefreshToken.js",
    "server/routes/authRoutes.js", "server/routes/examRoutes.js", "server/routes/questionRoutes.js", "server/routes/testRoutes.js", "server/routes/attemptRoutes.js", "server/routes/bookmarkRoutes.js", "server/routes/progressRoutes.js", "server/routes/adminRoutes.js",
    "server/controllers/authController.js", "server/controllers/examController.js", "server/controllers/questionController.js", "server/controllers/testController.js", "server/controllers/attemptController.js", "server/controllers/bookmarkController.js", "server/controllers/progressController.js", "server/controllers/adminController.js",
    "server/middleware/auth.js", "server/middleware/isAdmin.js", "server/middleware/upload.js", "server/middleware/errorHandler.js",
    "server/utils/generateToken.js", "server/utils/sendEmail.js", "server/utils/scoreAttempt.js"
)
foreach ($file in $serverFiles) { New-Item -ItemType File -Force -Path $file | Out-Null }

New-Item -ItemType Directory -Force -Path "client/src/api", "client/src/context", "client/src/components", "client/src/pages/auth", "client/src/pages/student", "client/src/pages/admin" | Out-Null

$clientFiles = @(
    "client/index.html", "client/package.json", "client/tailwind.config.js", "client/.env",
    "client/src/main.jsx", "client/src/App.jsx",
    "client/src/api/axios.js",
    "client/src/context/AuthContext.jsx",
    "client/src/components/Navbar.jsx", "client/src/components/ProtectedRoute.jsx", "client/src/components/QuestionCard.jsx", "client/src/components/Timer.jsx", "client/src/components/QuestionPalette.jsx",
    "client/src/pages/auth/Login.jsx", "client/src/pages/auth/Register.jsx", "client/src/pages/auth/VerifyOtp.jsx", "client/src/pages/auth/ForgotPassword.jsx",
    "client/src/pages/student/Dashboard.jsx", "client/src/pages/student/SelectExam.jsx", "client/src/pages/student/SelectSubject.jsx", "client/src/pages/student/PracticeSetup.jsx", "client/src/pages/student/TestScreen.jsx", "client/src/pages/student/Result.jsx", "client/src/pages/student/Analytics.jsx", "client/src/pages/student/Bookmarks.jsx", "client/src/pages/student/WrongAnswers.jsx",
    "client/src/pages/admin/AdminDashboard.jsx", "client/src/pages/admin/ManageQuestions.jsx", "client/src/pages/admin/QuestionForm.jsx", "client/src/pages/admin/ManageSyllabus.jsx", "client/src/pages/admin/ManageTests.jsx", "client/src/pages/admin/ManageStudents.jsx"
)
foreach ($file in $clientFiles) { New-Item -ItemType File -Force -Path $file | Out-Null }

Write-Host "File structure created successfully!"
