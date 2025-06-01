document.addEventListener("DOMContentLoaded", () => {
  initializeData()

  setupEventListeners()

  loadSubjects()
  loadAssignments()
  loadExams()
  loadGoals()
  loadSyllabus()
  updateStats()
  updateExamsCountdown()

  setInterval(updateExamsCountdown, 60000)
})

let appData = {
  subjects: [],
  assignments: [],
  exams: [],
  goals: [],
  syllabus: [],
  practiceQuestions: [],
  videoLectures: [],
  doubts: [],
  studyTimers: [],
}

function initializeData() {
  if (localStorage.getItem("studyTrackerData")) {
    appData = JSON.parse(localStorage.getItem("studyTrackerData"))

    // Ensure all new data structures exist
    if (!appData.syllabus) appData.syllabus = []
    if (!appData.practiceQuestions) appData.practiceQuestions = []
    if (!appData.videoLectures) appData.videoLectures = []
    if (!appData.doubts) appData.doubts = []
    if (!appData.studyTimers) appData.studyTimers = []
  } else {
    appData = {
      subjects: [],
      assignments: [],
      exams: [],
      goals: [],
      syllabus: [],
      practiceQuestions: [],
      videoLectures: [],
      doubts: [],
      studyTimers: [],
    }
    saveData()
  }

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode")
    document.getElementById("theme-toggle-btn").innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>'
  }
}

function saveData() {
  localStorage.setItem("studyTrackerData", JSON.stringify(appData))
}

function setupEventListeners() {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab")

      document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
      document.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.remove("active"))

      this.classList.add("active")
      document.getElementById(tabId).classList.add("active")
    })
  })

  document.getElementById("theme-toggle-btn").addEventListener("click", toggleTheme)

  document.getElementById("add-subject-btn").addEventListener("click", () => openModal("subject"))
  document.getElementById("add-assignment-btn").addEventListener("click", () => openModal("assignment"))
  document.getElementById("add-exam-btn").addEventListener("click", () => openModal("exam"))
  document.getElementById("add-goal-btn").addEventListener("click", () => openModal("goal"))
  document.getElementById("add-syllabus-btn").addEventListener("click", () => openModal("syllabus"))
  document.getElementById("add-question-btn").addEventListener("click", () => openModal("question"))
  document.getElementById("add-video-btn").addEventListener("click", () => openModal("video"))
  document.getElementById("add-doubt-btn").addEventListener("click", () => openModal("doubt"))

  document.getElementById("subject-form").addEventListener("submit", handleSubjectSubmit)
  document.getElementById("assignment-form").addEventListener("submit", handleAssignmentSubmit)
  document.getElementById("exam-form").addEventListener("submit", handleExamSubmit)
  document.getElementById("goal-form").addEventListener("submit", handleGoalSubmit)
  document.getElementById("syllabus-form").addEventListener("submit", handleSyllabusSubmit)
  document.getElementById("question-form").addEventListener("submit", handleQuestionSubmit)
  document.getElementById("video-form").addEventListener("submit", handleVideoSubmit)
  document.getElementById("doubt-form").addEventListener("submit", handleDoubtSubmit)

  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      this.closest(".modal").style.display = "none"
    })
  })

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    document.querySelectorAll(".modal").forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none"
      }
    })
  })

  // Study timer controls
  document.getElementById("start-timer-btn").addEventListener("click", startStudyTimer)
  document.getElementById("pause-timer-btn").addEventListener("click", pauseStudyTimer)
  document.getElementById("stop-timer-btn").addEventListener("click", stopStudyTimer)
}

// Toggle theme between light and dark mode
function toggleTheme() {
  const body = document.body
  const themeToggleBtn = document.getElementById("theme-toggle-btn")

  if (body.classList.contains("dark-mode")) {
    body.classList.remove("dark-mode")
    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>'
    localStorage.setItem("darkMode", "false")
  } else {
    body.classList.add("dark-mode")
    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>'
    localStorage.setItem("darkMode", "true")
  }
}

function openModal(type, id = null) {
  const modal = document.getElementById(`${type}-modal`)
  const form = document.getElementById(`${type}-form`)
  const modalTitle = document.getElementById(`${type}-modal-title`)

  form.reset()

  if (id) {
    modalTitle.textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`

    const item = appData[`${type}s`] ? appData[`${type}s`].find((item) => item.id === id) : null
    if (item) {
      document.getElementById(`${type}-id`).value = id

      switch (type) {
        case "subject":
          document.getElementById("subject-name").value = item.name
          document.getElementById("subject-code").value = item.code
          document.getElementById("teacher-name").value = item.teacher || ""
          document.getElementById("subject-color").value = item.color
          break
        case "assignment":
          document.getElementById("assignment-subject").value = item.subjectId
          document.getElementById("assignment-title").value = item.title
          document.getElementById("assignment-deadline").value = formatDateTimeForInput(item.deadline)
          document.getElementById("assignment-description").value = item.description || ""
          break
        case "exam":
          document.getElementById("exam-subject").value = item.subjectId
          document.getElementById("exam-date").value = formatDateTimeForInput(item.date)
          document.getElementById("exam-location").value = item.location || ""
          document.getElementById("exam-notes").value = item.notes || ""
          break
        case "goal":
          document.getElementById("goal-subject").value = item.subjectId
          document.getElementById("goal-title").value = item.title
          document.getElementById("goal-target").value = item.target
          document.getElementById("goal-deadline").value = formatDateForInput(item.deadline)
          break
        case "syllabus":
          document.getElementById("syllabus-subject").value = item.subjectId
          document.getElementById("syllabus-unit").value = item.unit
          document.getElementById("syllabus-chapter").value = item.chapter
          document.getElementById("syllabus-topic").value = item.topic
          document.getElementById("syllabus-description").value = item.description || ""
          document.getElementById("syllabus-important").checked = item.isImportant
          break
        case "question":
          document.getElementById("question-syllabus").value = item.syllabusId
          document.getElementById("question-text").value = item.questionText
          document.getElementById("question-answer").value = item.answer || ""
          document.getElementById("question-difficulty").value = item.difficulty
          break
        case "video":
          document.getElementById("video-syllabus").value = item.syllabusId
          document.getElementById("video-title").value = item.title
          document.getElementById("video-url").value = item.url
          document.getElementById("video-description").value = item.description || ""
          break
        case "doubt":
          document.getElementById("doubt-syllabus").value = item.syllabusId
          document.getElementById("doubt-question").value = item.question
          document.getElementById("doubt-status").value = item.status
          document.getElementById("doubt-solution").value = item.solution || ""
          break
      }
    }
  } else {
    modalTitle.textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`
    document.getElementById(`${type}-id`).value = ""
  }

  if (type === "assignment" || type === "exam" || type === "goal" || type === "syllabus") {
    const subjectSelect = document.getElementById(`${type}-subject`)

    while (subjectSelect.options.length > 1) {
      subjectSelect.remove(1)
    }

    appData.subjects.forEach((subject) => {
      const option = document.createElement("option")
      option.value = subject.id
      option.textContent = subject.name
      subjectSelect.appendChild(option)
    })
  }

  if (type === "question" || type === "video" || type === "doubt") {
    const syllabusSelect = document.getElementById(`${type}-syllabus`)

    while (syllabusSelect.options.length > 1) {
      syllabusSelect.remove(1)
    }

    appData.syllabus.forEach((syllabusItem) => {
      const subject = appData.subjects.find((s) => s.id === syllabusItem.subjectId)
      const option = document.createElement("option")
      option.value = syllabusItem.id
      option.textContent = `${subject ? subject.name : "Unknown"} - Unit ${syllabusItem.unit} - ${syllabusItem.topic}`
      syllabusSelect.appendChild(option)
    })
  }

  modal.style.display = "block"
}

function handleSubjectSubmit(e) {
  e.preventDefault()

  const id = document.getElementById("subject-id").value
  const name = document.getElementById("subject-name").value
  const code = document.getElementById("subject-code").value
  const teacher = document.getElementById("teacher-name").value
  const color = document.getElementById("subject-color").value

  if (id) {

    // subjct ko update karna

    const index = appData.subjects.findIndex((subject) => subject.id === id)
    if (index !== -1) {
      appData.subjects[index] = {
        ...appData.subjects[index],
        name,
        code,
        teacher,
        color,
      }
    }
  } else {
    const newSubject = {
      id: generateId(),
      name,
      code,
      teacher,
      color,
      createdAt: new Date().toISOString(),
    }
    appData.subjects.push(newSubject)
  }

  saveData()
  loadSubjects()
  updateStats()

  document.getElementById("subject-modal").style.display = "none"
}

function handleAssignmentSubmit(e) {
  e.preventDefault()

  const id = document.getElementById("assignment-id").value
  const subjectId = document.getElementById("assignment-subject").value
  const title = document.getElementById("assignment-title").value
  const deadline = new Date(document.getElementById("assignment-deadline").value).toISOString()
  const description = document.getElementById("assignment-description").value

  if (id) {
    const index = appData.assignments.findIndex((assignment) => assignment.id === id)
    if (index !== -1) {
      appData.assignments[index] = {
        ...appData.assignments[index],
        subjectId,
        title,
        deadline,
        description,
      }
    }
  } else {
    // Add new assignment
    const newAssignment = {
      id: generateId(),
      subjectId,
      title,
      deadline,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    appData.assignments.push(newAssignment)
  }

  // update subject ko save karega

  saveData()
  loadAssignments()
  updateStats()

  // Close modal
  document.getElementById("assignment-modal").style.display = "none"
}

// Handle exam form submission
function handleExamSubmit(e) {
  e.preventDefault()

  const id = document.getElementById("exam-id").value
  const subjectId = document.getElementById("exam-subject").value
  const date = new Date(document.getElementById("exam-date").value).toISOString()
  const location = document.getElementById("exam-location").value
  const notes = document.getElementById("exam-notes").value

  if (id) {
    // Update existing exam
    const index = appData.exams.findIndex((exam) => exam.id === id)
    if (index !== -1) {
      appData.exams[index] = {
        ...appData.exams[index],
        subjectId,
        date,
        location,
        notes,
      }
    }
  } else {
    // Add new exam
    const newExam = {
      id: generateId(),
      subjectId,
      date,
      location,
      notes,
      createdAt: new Date().toISOString(),
    }
    appData.exams.push(newExam)
  }

  // Save data and update UI
  saveData()
  loadExams()
  updateExamsCountdown()
  updateStats()

  // Close modal
  document.getElementById("exam-modal").style.display = "none"
}

// Handle goal form submission
function handleGoalSubmit(e) {
  e.preventDefault()

  const id = document.getElementById("goal-id").value
  const subjectId = document.getElementById("goal-subject").value
  const title = document.getElementById("goal-title").value
  const target = Number.parseInt(document.getElementById("goal-target").value)
  const deadline = new Date(document.getElementById("goal-deadline").value).toISOString()

  if (id) {
    // Update existing goal
    const index = appData.goals.findIndex((goal) => goal.id === id)
    if (index !== -1) {
      appData.goals[index] = {
        ...appData.goals[index],
        subjectId,
        title,
        target,
        deadline,
      }
    }
  } else {
    // Add new goal
    const newGoal = {
      id: generateId(),
      subjectId,
      title,
      target,
      progress: 0,
      deadline,
      createdAt: new Date().toISOString(),
    }
    appData.goals.push(newGoal)
  }

  // Save data and update UI
  saveData()
  loadGoals()
  updateStats()

  // Close modal
  document.getElementById("goal-modal").style.display = "none"
}

// Handle syllabus form submission
function handleSyllabusSubmit(e) {
  e.preventDefault()

  const id = document.getElementById("syllabus-id").value
  const subjectId = document.getElementById("syllabus-subject").value
  const unit = document.getElementById("syllabus-unit").value
  const chapter = document.getElementById("syllabus-chapter").value
  const topic = document.getElementById("syllabus-topic").value
  const description = document.getElementById("syllabus-description").value
  const isImportant = document.getElementById("syllabus-important").checked

  if (id) {
    // Update existing syllabus item
    const index = appData.syllabus.findIndex((item) => item.id === id)
    if (index !== -1) {
      appData.syllabus[index] = {
        ...appData.syllabus[index],
        subjectId,
        unit,
        chapter,
        topic,
        description,
        isImportant,
      }
    }
  } else {
    // Add new syllabus item
    const newSyllabusItem = {
      id: generateId(),
      subjectId,
      unit,
      chapter,
      topic,
      description,
      isImportant,
      isCompleted: false,
      isRevised: false,
      completedAt: null,
      revisedAt: null,
      createdAt: new Date().toISOString(),
    }
    appData.syllabus.push(newSyllabusItem)
  }

  // ui pe  Save data and update karega
  saveData()
  loadSyllabus()
  updateStats()
  updateSyllabusCompletion()

  // Close modal
  document.getElementById("syllabus-modal").style.display = "none"
}

// practice question form submission ko handle karega
function handleQuestionSubmit(e) {
  e.preventDefault()

  const id = document.getElementById("question-id").value
  const syllabusId = document.getElementById("question-syllabus").value
  const questionText = document.getElementById("question-text").value
  const answer = document.getElementById("question-answer").value
  const difficulty = document.getElementById("question-difficulty").value

  if (id) {
    // Update existing question
    const index = appData.practiceQuestions.findIndex((item) => item.id === id)
    if (index !== -1) {
      appData.practiceQuestions[index] = {
        ...appData.practiceQuestions[index],
        syllabusId,
        questionText,
        answer,
        difficulty,
      }
    }
  } else {
    // Add new question
    const newQuestion = {
      id: generateId(),
      syllabusId,
      questionText,
      answer,
      difficulty,
      isSolved: false,
      createdAt: new Date().toISOString(),
    }
    appData.practiceQuestions.push(newQuestion)
  }

  // Save data and update UI
  saveData()
  loadPracticeQuestions()

  // Close modal
  document.getElementById("question-modal").style.display = "none"
}

// Handle video lecture form submission
function handleVideoSubmit(e) {
  e.preventDefault()

  const id = document.getElementById("video-id").value
  const syllabusId = document.getElementById("video-syllabus").value
  const title = document.getElementById("video-title").value
  const url = document.getElementById("video-url").value
  const description = document.getElementById("video-description").value

  if (id) {
    // Update existing video
    const index = appData.videoLectures.findIndex((item) => item.id === id)
    if (index !== -1) {
      appData.videoLectures[index] = {
        ...appData.videoLectures[index],
        syllabusId,
        title,
        url,
        description,
      }
    }
  } else {
    // Add new video
    const newVideo = {
      id: generateId(),
      syllabusId,
      title,
      url,
      description,
      watched: false,
      createdAt: new Date().toISOString(),
    }
    appData.videoLectures.push(newVideo)
  }

  // Save data and update UI
  saveData()
  loadVideoLectures()

  // Close modal
  document.getElementById("video-modal").style.display = "none"
}

// Handle doubt form submission
function handleDoubtSubmit(e) {
  e.preventDefault()

  const id = document.getElementById("doubt-id").value
  const syllabusId = document.getElementById("doubt-syllabus").value
  const question = document.getElementById("doubt-question").value
  const status = document.getElementById("doubt-status").value
  const solution = document.getElementById("doubt-solution").value

  if (id) {
    // Update existing doubt
    const index = appData.doubts.findIndex((item) => item.id === id)
    if (index !== -1) {
      appData.doubts[index] = {
        ...appData.doubts[index],
        syllabusId,
        question,
        status,
        solution,
      }
    }
  } else {
    // Add new doubt
    const newDoubt = {
      id: generateId(),
      syllabusId,
      question,
      status,
      solution,
      createdAt: new Date().toISOString(),
    }
    appData.doubts.push(newDoubt)
  }

  // Save data and update UI
  saveData()
  loadDoubts()

  // Close modal
  document.getElementById("doubt-modal").style.display = "none"
}

// Load subjects
function loadSubjects() {
  const subjectsList = document.getElementById("subjects-list")

  if (appData.subjects.length === 0) {
    subjectsList.innerHTML = '<p class="no-data">No subjects added yet</p>'
    return
  }

  // Sort subjects by name
  const sortedSubjects = [...appData.subjects].sort((a, b) => a.name.localeCompare(b.name))

  let html = ""

  sortedSubjects.forEach((subject) => {
    // Count assignments, exams, and goals for this subject
    const assignmentCount = appData.assignments.filter((a) => a.subjectId === subject.id).length
    const examCount = appData.exams.filter((e) => e.subjectId === subject.id).length
    const goalCount = appData.goals.filter((g) => g.subjectId === subject.id).length
    const syllabusCount = appData.syllabus.filter((s) => s.subjectId === subject.id).length

    // Calculate syllabus completion percentage
    const syllabusItems = appData.syllabus.filter((s) => s.subjectId === subject.id)
    const completedItems = syllabusItems.filter((s) => s.isCompleted).length
    const completionPercentage =
      syllabusItems.length > 0 ? Math.round((completedItems / syllabusItems.length) * 100) : 0

    html += `
      <div class="card">
        <div class="subject-color" style="background-color: ${subject.color}"></div>
        <div class="card-header">
          <div>
            <h3 class="card-title">${subject.name}</h3>
            <p class="card-subtitle">${subject.code}</p>
          </div>
          <div class="card-actions">
            <button class="card-action edit" onclick="openModal('subject', '${subject.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="card-action delete" onclick="deleteItem('subject', '${subject.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-content">
          ${subject.teacher ? `<p><i class="fas fa-user"></i> ${subject.teacher}</p>` : ""}
          ${
            syllabusCount > 0
              ? `
            <div class="progress-container mt-2">
              <div class="progress-bar" style="width: ${completionPercentage}%"></div>
            </div>
            <div class="progress-text">Syllabus: ${completionPercentage}% completed</div>
          `
              : ""
          }
        </div>
        <div class="card-footer">
          <span><i class="fas fa-tasks"></i> ${assignmentCount} assignments</span>
          <span><i class="fas fa-calendar-alt"></i> ${examCount} exams</span>
          <span><i class="fas fa-bullseye"></i> ${goalCount} goals</span>
          <span><i class="fas fa-book"></i> ${syllabusCount} topics</span>
        </div>
      </div>
    `
  })

  subjectsList.innerHTML = html
}

// Load assignments
function loadAssignments() {
  const assignmentsList = document.getElementById("assignments-list")

  if (appData.assignments.length === 0) {
    assignmentsList.innerHTML = '<p class="no-data">No assignments added yet</p>'
    return
  }

  // Sort assignments by deadline (closest first)
  const sortedAssignments = [...appData.assignments].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  let html = ""

  sortedAssignments.forEach((assignment) => {
    const subject = appData.subjects.find((s) => s.id === assignment.subjectId)
    const deadlineDate = new Date(assignment.deadline)
    const isOverdue = deadlineDate < new Date() && !assignment.completed

    html += `
      <div class="card ${assignment.completed ? "assignment-completed" : ""}">
        <div class="subject-color" style="background-color: ${subject ? subject.color : "#ccc"}"></div>
        <div class="card-header">
          <div>
            <h3 class="card-title">${assignment.title}</h3>
            <p class="card-subtitle">${subject ? subject.name : "Unknown Subject"}</p>
          </div>
          <div class="card-actions">
            <button class="card-action edit" onclick="openModal('assignment', '${assignment.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="card-action delete" onclick="deleteItem('assignment', '${assignment.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-content">
          <p class="assignment-deadline ${isOverdue ? "text-danger" : ""}">
            <i class="fas fa-clock"></i> Due: ${formatDateTime(assignment.deadline)}
            ${isOverdue ? " (Overdue)" : ""}
          </p>
          ${assignment.description ? `<p>${assignment.description}</p>` : ""}
          <div class="assignment-status">
            <input type="checkbox" id="assignment-${assignment.id}" 
              ${assignment.completed ? "checked" : ""} 
              onchange="toggleAssignmentStatus('${assignment.id}')">
            <label for="assignment-${assignment.id}">Mark as completed</label>
          </div>
        </div>
      </div>
    `
  })

  assignmentsList.innerHTML = html
}

// Load exams
function loadExams() {
  const examsList = document.getElementById("exams-list")

  if (appData.exams.length === 0) {
    examsList.innerHTML = '<p class="no-data">No exams added yet</p>'
    return
  }

  // Sort exams by date (closest first)
  const sortedExams = [...appData.exams].sort((a, b) => new Date(a.date) - new Date(b.date))

  let html = ""

  sortedExams.forEach((exam) => {
    const subject = appData.subjects.find((s) => s.id === exam.subjectId)
    const examDate = new Date(exam.date)
    const isPast = examDate < new Date()

    html += `
      <div class="card ${isPast ? "exam-past" : ""}">
        <div class="subject-color" style="background-color: ${subject ? subject.color : "#ccc"}"></div>
        <div class="card-header">
          <div>
            <h3 class="card-title">${subject ? subject.name : "Unknown Subject"} Exam</h3>
            <p class="card-subtitle">${subject ? subject.code : ""}</p>
          </div>
          <div class="card-actions">
            <button class="card-action edit" onclick="openModal('exam', '${exam.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="card-action delete" onclick="deleteItem('exam', '${exam.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-content">
          <p>
            <i class="fas fa-calendar-alt"></i> ${formatDateTime(exam.date)}
            ${isPast ? " (Past)" : ""}
          </p>
          ${exam.location ? `<p><i class="fas fa-map-marker-alt"></i> ${exam.location}</p>` : ""}
          ${exam.notes ? `<p><i class="fas fa-sticky-note"></i> ${exam.notes}</p>` : ""}
        </div>
        ${
          !isPast
            ? `
        <div class="card-footer">
          <div class="countdown" id="exam-countdown-${exam.id}">
            ${getCountdown(exam.date)}
          </div>
        </div>
        `
            : ""
        }
      </div>
    `
  })

  examsList.innerHTML = html
}

// Load goals
function loadGoals() {
  const goalsList = document.getElementById("goals-list")

  if (appData.goals.length === 0) {
    goalsList.innerHTML = '<p class="no-data">No goals added yet</p>'
    return
  }

  // Sort goals by deadline (closest first)
  const sortedGoals = [...appData.goals].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  let html = ""

  sortedGoals.forEach((goal) => {
    const subject = appData.subjects.find((s) => s.id === goal.subjectId)
    const deadlineDate = new Date(goal.deadline)
    const isPast = deadlineDate < new Date()
    const progressPercentage = Math.round((goal.progress / goal.target) * 100)
    const isCompleted = goal.progress >= goal.target

    html += `
      <div class="card">
        <div class="subject-color" style="background-color: ${subject ? subject.color : "#ccc"}"></div>
        <div class="card-header">
          <div>
            <h3 class="card-title">${goal.title}</h3>
            <p class="card-subtitle">${subject ? subject.name : "Unknown Subject"}</p>
          </div>
          <div class="card-actions">
            <button class="card-action edit" onclick="openModal('goal', '${goal.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="card-action delete" onclick="deleteItem('goal', '${goal.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-content">
          <p>
            <i class="fas fa-calendar-alt"></i> Deadline: ${formatDate(goal.deadline)}
            ${isPast && !isCompleted ? " (Overdue)" : ""}
          </p>
          <p>Progress: ${goal.progress} / ${goal.target}</p>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progressPercentage}%"></div>
          </div>
          <div class="progress-text">${progressPercentage}%</div>
          <div class="goal-actions">
            <button class="btn btn-small" onclick="updateGoalProgress('${goal.id}', -1)" ${goal.progress <= 0 ? "disabled" : ""}>
              <i class="fas fa-minus"></i>
            </button>
            <button class="btn btn-small" onclick="updateGoalProgress('${goal.id}', 1)" ${goal.progress >= goal.target ? "disabled" : ""}>
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `
  })

  goalsList.innerHTML = html
}

// Load syllabus
function loadSyllabus() {
  const syllabusList = document.getElementById("syllabus-list")

  if (!syllabusList) return

  if (appData.syllabus.length === 0) {
    syllabusList.innerHTML = '<p class="no-data">No syllabus items added yet</p>'
    return
  }

  // Group syllabus by subject and unit
  const syllabusGroups = {}

  appData.syllabus.forEach((item) => {
    const subject = appData.subjects.find((s) => s.id === item.subjectId)
    if (!subject) return

    if (!syllabusGroups[subject.id]) {
      syllabusGroups[subject.id] = {
        subject: subject,
        units: {},
      }
    }

    if (!syllabusGroups[subject.id].units[item.unit]) {
      syllabusGroups[subject.id].units[item.unit] = []
    }

    syllabusGroups[subject.id].units[item.unit].push(item)
  })

  let html = ""

  // Generate HTML for each subject and its units
  Object.values(syllabusGroups).forEach((group) => {
    const subject = group.subject

    html += `
      <div class="syllabus-subject">
        <div class="syllabus-subject-header" style="border-left: 4px solid ${subject.color}">
          <h3>${subject.name} (${subject.code})</h3>
          <div class="syllabus-stats">
            <span class="syllabus-completion">
              ${calculateSubjectCompletion(subject.id)}% Complete
            </span>
          </div>
        </div>
        <div class="syllabus-units">
    `

    // Sort units numerically
    const sortedUnits = Object.keys(group.units).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

    sortedUnits.forEach((unitNumber) => {
      const unitItems = group.units[unitNumber]

      html += `
        <div class="syllabus-unit">
          <div class="syllabus-unit-header">
            <h4>Unit ${unitNumber}</h4>
            <div class="unit-completion">
              ${calculateUnitCompletion(subject.id, unitNumber)}% Complete
            </div>
          </div>
          <div class="syllabus-topics">
      `

      // Sort topics by chapter
      const sortedTopics = [...unitItems].sort((a, b) => {
        if (a.chapter !== b.chapter) {
          return Number.parseInt(a.chapter) - Number.parseInt(b.chapter)
        }
        return a.topic.localeCompare(b.topic)
      })

      sortedTopics.forEach((topic) => {
        const videoCount = appData.videoLectures.filter((v) => v.syllabusId === topic.id).length
        const questionCount = appData.practiceQuestions.filter((q) => q.syllabusId === topic.id).length
        const doubtCount = appData.doubts.filter((d) => d.syllabusId === topic.id).length

        html += `
          <div class="syllabus-topic ${topic.isCompleted ? "completed" : ""} ${topic.isImportant ? "important" : ""}">
            <div class="topic-header">
              <div class="topic-title">
                <div class="topic-checkbox">
                  <input type="checkbox" id="topic-${topic.id}" 
                    ${topic.isCompleted ? "checked" : ""} 
                    onchange="toggleTopicCompletion('${topic.id}')">
                </div>
                <h5>
                  ${topic.isImportant ? '<i class="fas fa-star important-star"></i>' : ""}
                  Chapter ${topic.chapter}: ${topic.topic}
                </h5>
              </div>
              <div class="topic-actions">
                <button class="topic-action" onclick="toggleTopicRevision('${topic.id}')">
                  <i class="fas ${topic.isRevised ? "fa-check-circle" : "fa-history"}"></i>
                </button>
                <button class="topic-action" onclick="startTopicTimer('${topic.id}')">
                  <i class="fas fa-clock"></i>
                </button>
                <button class="topic-action" onclick="openModal('syllabus', '${topic.id}')">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="topic-action delete" onclick="deleteItem('syllabus', '${topic.id}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            ${topic.description ? `<div class="topic-description">${topic.description}</div>` : ""}
            <div class="topic-resources">
              ${videoCount > 0 ? `<span class="resource-badge video" onclick="showTopicVideos('${topic.id}')"><i class="fas fa-video"></i> ${videoCount}</span>` : ""}
              ${questionCount > 0 ? `<span class="resource-badge question" onclick="showTopicQuestions('${topic.id}')"><i class="fas fa-question-circle"></i> ${questionCount}</span>` : ""}
              ${doubtCount > 0 ? `<span class="resource-badge doubt" onclick="showTopicDoubts('${topic.id}')"><i class="fas fa-exclamation-circle"></i> ${doubtCount}</span>` : ""}
              <div class="resource-actions">
                <button class="btn btn-small" onclick="openModal('video', null, '${topic.id}')">
                  <i class="fas fa-plus"></i> Video
                </button>
                <button class="btn btn-small" onclick="openModal('question', null, '${topic.id}')">
                  <i class="fas fa-plus"></i> Question
                </button>
                <button class="btn btn-small" onclick="openModal('doubt', null, '${topic.id}')">
                  <i class="fas fa-plus"></i> Doubt
                </button>
              </div>
            </div>
          </div>
        `
      })

      html += `
          </div>
        </div>
      `
    })

    html += `
        </div>
      </div>
    `
  })

  syllabusList.innerHTML = html
  updateSyllabusCompletion()
}

// Load practice questions
function loadPracticeQuestions() {
  const questionsList = document.getElementById("questions-list")

  if (!questionsList) return

  if (appData.practiceQuestions.length === 0) {
    questionsList.innerHTML = '<p class="no-data">No practice questions added yet</p>'
    return
  }

  // Sort questions by difficulty
  const sortedQuestions = [...appData.practiceQuestions].sort((a, b) => {
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  })

  let html = ""

  sortedQuestions.forEach((question) => {
    const syllabusItem = appData.syllabus.find((s) => s.id === question.syllabusId)
    const subject = syllabusItem ? appData.subjects.find((s) => s.id === syllabusItem.subjectId) : null

    const difficultyClass =
      {
        easy: "difficulty-easy",
        medium: "difficulty-medium",
        hard: "difficulty-hard",
      }[question.difficulty] || ""

    html += `
      <div class="card question-card ${question.isSolved ? "question-solved" : ""} ${difficultyClass}">
        <div class="card-header">
          <div>
            <h3 class="card-title">${question.questionText}</h3>
            <p class="card-subtitle">
              ${subject ? subject.name : "Unknown Subject"} - 
              ${syllabusItem ? `Unit ${syllabusItem.unit}, Chapter ${syllabusItem.chapter}: ${syllabusItem.topic}` : "Unknown Topic"}
            </p>
          </div>
          <div class="card-actions">
            <button class="card-action edit" onclick="openModal('question', '${question.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="card-action delete" onclick="deleteItem('practiceQuestion', '${question.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-content">
          <div class="question-difficulty">
            <span class="difficulty-badge ${difficultyClass}">
              ${question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
          </div>
          ${
            question.answer
              ? `
            <div class="question-answer ${!question.isSolved ? "hidden-answer" : ""}">
              <h4>Answer:</h4>
              <p>${question.answer}</p>
            </div>
          `
              : ""
          }
          <div class="question-status">
            <input type="checkbox" id="question-${question.id}" 
              ${question.isSolved ? "checked" : ""} 
              onchange="toggleQuestionStatus('${question.id}')">
            <label for="question-${question.id}">Mark as solved</label>
          </div>
        </div>
      </div>
    `
  })

  questionsList.innerHTML = html
}

// Load video lectures
function loadVideoLectures() {
  const videosList = document.getElementById("videos-list")

  if (!videosList) return

  if (appData.videoLectures.length === 0) {
    videosList.innerHTML = '<p class="no-data">No video lectures added yet</p>'
    return
  }

  // Sort videos by topic
  const sortedVideos = [...appData.videoLectures].sort((a, b) => {
    const syllabusA = appData.syllabus.find((s) => s.id === a.syllabusId)
    const syllabusB = appData.syllabus.find((s) => s.id === b.syllabusId)

    if (syllabusA && syllabusB) {
      if (syllabusA.subjectId !== syllabusB.subjectId) {
        return syllabusA.subjectId.localeCompare(syllabusB.subjectId)
      }
      if (syllabusA.unit !== syllabusB.unit) {
        return Number.parseInt(syllabusA.unit) - Number.parseInt(syllabusB.unit)
      }
      return Number.parseInt(syllabusA.chapter) - Number.parseInt(syllabusB.chapter)
    }
    return 0
  })

  let html = ""

  sortedVideos.forEach((video) => {
    const syllabusItem = appData.syllabus.find((s) => s.id === video.syllabusId)
    const subject = syllabusItem ? appData.subjects.find((s) => s.id === syllabusItem.subjectId) : null

    html += `
      <div class="card video-card ${video.watched ? "video-watched" : ""}">
        <div class="card-header">
          <div>
            <h3 class="card-title">${video.title}</h3>
            <p class="card-subtitle">
              ${subject ? subject.name : "Unknown Subject"} - 
              ${syllabusItem ? `Unit ${syllabusItem.unit}, Chapter ${syllabusItem.chapter}: ${syllabusItem.topic}` : "Unknown Topic"}
            </p>
          </div>
          <div class="card-actions">
            <button class="card-action edit" onclick="openModal('video', '${video.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="card-action delete" onclick="deleteItem('videoLecture', '${video.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-content">
          <div class="video-link">
            <a href="${video.url}" target="_blank" class="btn btn-primary">
              <i class="fas fa-external-link-alt"></i> Watch Video
            </a>
          </div>
          ${video.description ? `<p class="video-description">${video.description}</p>` : ""}
          <div class="video-status">
            <input type="checkbox" id="video-${video.id}" 
              ${video.watched ? "checked" : ""} 
              onchange="toggleVideoStatus('${video.id}')">
            <label for="video-${video.id}">Mark as watched</label>
          </div>
        </div>
      </div>
    `
  })

  videosList.innerHTML = html
}

// Load doubts
function loadDoubts() {
  const doubtsList = document.getElementById("doubts-list")

  if (!doubtsList) return

  if (appData.doubts.length === 0) {
    doubtsList.innerHTML = '<p class="no-data">No doubts added yet</p>'
    return
  }

  // Sort doubts by status (unsolved first)
  const sortedDoubts = [...appData.doubts].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "unsolved" ? -1 : 1
    }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  let html = ""

  sortedDoubts.forEach((doubt) => {
    const syllabusItem = appData.syllabus.find((s) => s.id === doubt.syllabusId)
    const subject = syllabusItem ? appData.subjects.find((s) => s.id === syllabusItem.subjectId) : null

    const statusClass = doubt.status === "solved" ? "doubt-solved" : "doubt-unsolved"

    html += `
      <div class="card doubt-card ${statusClass}">
        <div class="card-header">
          <div>
            <h3 class="card-title">${doubt.question}</h3>
            <p class="card-subtitle">
              ${subject ? subject.name : "Unknown Subject"} - 
              ${syllabusItem ? `Unit ${syllabusItem.unit}, Chapter ${syllabusItem.chapter}: ${syllabusItem.topic}` : "Unknown Topic"}
            </p>
          </div>
          <div class="card-actions">
            <button class="card-action edit" onclick="openModal('doubt', '${doubt.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="card-action delete" onclick="deleteItem('doubt', '${doubt.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-content">
          <div class="doubt-status-badge ${statusClass}">
            ${doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
          </div>
          ${
            doubt.solution
              ? `
            <div class="doubt-solution">
              <h4>Solution:</h4>
              <p>${doubt.solution}</p>
            </div>
          `
              : ""
          }
          <div class="doubt-actions">
            <button class="btn ${doubt.status === "solved" ? "btn-warning" : "btn-primary"}" 
              onclick="toggleDoubtStatus('${doubt.id}')">
              <i class="fas ${doubt.status === "solved" ? "fa-question-circle" : "fa-check-circle"}"></i>
              Mark as ${doubt.status === "solved" ? "Unsolved" : "Solved"}
            </button>
          </div>
        </div>
      </div>
    `
  })

  doubtsList.innerHTML = html
}

function updateExamsCountdown() {
  const examsCountdown = document.getElementById("exams-countdown")

  const futureExams = appData.exams
    .filter((exam) => new Date(exam.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4)

  if (futureExams.length === 0) {
    examsCountdown.innerHTML = '<p class="no-data">No upcoming exams</p>'
    return
  }

  let html = ""

  futureExams.forEach((exam) => {
    const subject = appData.subjects.find((s) => s.id === exam.subjectId)

    html += `
      <div class="exam-countdown-card">
        <h3>${subject ? subject.name : "Unknown Subject"}</h3>
        <div class="countdown">${getCountdown(exam.date)}</div>
        <div class="exam-details">
          <p><i class="fas fa-calendar-alt"></i> ${formatDateTime(exam.date)}</p>
          ${exam.location ? `<p><i class="fas fa-map-marker-alt"></i> ${exam.location}</p>` : ""}
        </div>
      </div>
    `
  })

  examsCountdown.innerHTML = html

  appData.exams.forEach((exam) => {
    const countdownElement = document.getElementById(`exam-countdown-${exam.id}`)
    if (countdownElement) {
      countdownElement.textContent = getCountdown(exam.date)
    }
  })
}

function updateGoalProgress(goalId, change) {
  const index = appData.goals.findIndex((goal) => goal.id === goalId)

  if (index !== -1) {
    const goal = appData.goals[index]
    const newProgress = Math.max(0, Math.min(goal.target, goal.progress + change))

    appData.goals[index] = {
      ...goal,
      progress: newProgress,
    }

    saveData()
    loadGoals()
  }
}

function toggleAssignmentStatus(assignmentId) {
  const index = appData.assignments.findIndex((assignment) => assignment.id === assignmentId)

  if (index !== -1) {
    appData.assignments[index] = {
      ...appData.assignments[index],
      completed: !appData.assignments[index].completed,
    }

    saveData()
    loadAssignments()
  }
}

// Toggle topic completion status
function toggleTopicCompletion(topicId) {
  const index = appData.syllabus.findIndex((item) => item.id === topicId)

  if (index !== -1) {
    const isCompleted = !appData.syllabus[index].isCompleted

    appData.syllabus[index] = {
      ...appData.syllabus[index],
      isCompleted: isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : null,
    }

    saveData()
    loadSyllabus()
    updateSyllabusCompletion()
    loadSubjects() // Update subject cards with new completion percentages
  }
}

// Toggle topic revision status
function toggleTopicRevision(topicId) {
  const index = appData.syllabus.findIndex((item) => item.id === topicId)

  if (index !== -1) {
    const isRevised = !appData.syllabus[index].isRevised

    appData.syllabus[index] = {
      ...appData.syllabus[index],
      isRevised: isRevised,
      revisedAt: isRevised ? new Date().toISOString() : null,
    }

    saveData()
    loadSyllabus()
  }
}

// Toggle question solved status
function toggleQuestionStatus(questionId) {
  const index = appData.practiceQuestions.findIndex((item) => item.id === questionId)

  if (index !== -1) {
    appData.practiceQuestions[index] = {
      ...appData.practiceQuestions[index],
      isSolved: !appData.practiceQuestions[index].isSolved,
    }

    saveData()
    loadPracticeQuestions()
  }
}

// Toggle video watched status
function toggleVideoStatus(videoId) {
  const index = appData.videoLectures.findIndex((item) => item.id === videoId)

  if (index !== -1) {
    appData.videoLectures[index] = {
      ...appData.videoLectures[index],
      watched: !appData.videoLectures[index].watched,
    }

    saveData()
    loadVideoLectures()
  }
}

// Toggle doubt status
function toggleDoubtStatus(doubtId) {
  const index = appData.doubts.findIndex((item) => item.id === doubtId)

  if (index !== -1) {
    const newStatus = appData.doubts[index].status === "solved" ? "unsolved" : "solved"

    appData.doubts[index] = {
      ...appData.doubts[index],
      status: newStatus,
    }

    saveData()
    loadDoubts()
  }
}

// Calculate subject completion percentage
function calculateSubjectCompletion(subjectId) {
  const syllabusItems = appData.syllabus.filter((item) => item.subjectId === subjectId)

  if (syllabusItems.length === 0) return 0

  const completedItems = syllabusItems.filter((item) => item.isCompleted).length
  return Math.round((completedItems / syllabusItems.length) * 100)
}

// Calculate unit completion percentage
function calculateUnitCompletion(subjectId, unit) {
  const unitItems = appData.syllabus.filter((item) => item.subjectId === subjectId && item.unit === unit)

  if (unitItems.length === 0) return 0

  const completedItems = unitItems.filter((item) => item.isCompleted).length
  return Math.round((completedItems / unitItems.length) * 100)
}

// Update syllabus completion stats
function updateSyllabusCompletion() {
  // Update subject completion percentages
  appData.subjects.forEach((subject) => {
    const completionPercentage = calculateSubjectCompletion(subject.id)
    const completionElement = document.querySelector(
      `.syllabus-subject-header h3:contains('${subject.name}') + .syllabus-stats .syllabus-completion`,
    )

    if (completionElement) {
      completionElement.textContent = `${completionPercentage}% Complete`
    }
  })
}

// Show topic videos
function showTopicVideos(topicId) {
  const videos = appData.videoLectures.filter((v) => v.syllabusId === topicId)
  const syllabusItem = appData.syllabus.find((s) => s.id === topicId)

  if (!videos.length || !syllabusItem) return

  const subject = appData.subjects.find((s) => s.id === syllabusItem.subjectId)

  let html = `
    <div class="resource-modal-header">
      <h3>Videos for ${subject ? subject.name : "Unknown Subject"} - ${syllabusItem.topic}</h3>
      <span class="close-resource">&times;</span>
    </div>
    <div class="resource-modal-content">
  `

  videos.forEach((video) => {
    html += `
      <div class="resource-item ${video.watched ? "resource-completed" : ""}">
        <div class="resource-item-header">
          <h4>${video.title}</h4>
          <div class="resource-item-actions">
            <button class="resource-action" onclick="toggleVideoStatus('${video.id}')">
              <i class="fas ${video.watched ? "fa-check-circle" : "fa-circle"}"></i>
            </button>
            <button class="resource-action" onclick="openModal('video', '${video.id}')">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
        <div class="resource-item-content">
          <a href="${video.url}" target="_blank" class="btn btn-small">
            <i class="fas fa-external-link-alt"></i> Watch
          </a>
          ${video.description ? `<p>${video.description}</p>` : ""}
        </div>
      </div>
    `
  })

  html += `
    </div>
    <div class="resource-modal-footer">
      <button class="btn" onclick="openModal('video', null, '${topicId}')">
        <i class="fas fa-plus"></i> Add Video
      </button>
    </div>
  `

  const resourceModal = document.getElementById("resource-modal")
  resourceModal.innerHTML = html
  resourceModal.style.display = "block"

  document.querySelector(".close-resource").addEventListener("click", () => {
    resourceModal.style.display = "none"
  })
}

// Show topic questions
function showTopicQuestions(topicId) {
  const questions = appData.practiceQuestions.filter((q) => q.syllabusId === topicId)
  const syllabusItem = appData.syllabus.find((s) => s.id === topicId)

  if (!questions.length || !syllabusItem) return

  const subject = appData.subjects.find((s) => s.id === syllabusItem.subjectId)

  let html = `
    <div class="resource-modal-header">
      <h3>Practice Questions for ${subject ? subject.name : "Unknown Subject"} - ${syllabusItem.topic}</h3>
      <span class="close-resource">&times;</span>
    </div>
    <div class="resource-modal-content">
  `

  questions.forEach((question) => {
    const difficultyClass =
      {
        easy: "difficulty-easy",
        medium: "difficulty-medium",
        hard: "difficulty-hard",
      }[question.difficulty] || ""

    html += `
      <div class="resource-item ${question.isSolved ? "resource-completed" : ""} ${difficultyClass}">
        <div class="resource-item-header">
          <h4>${question.questionText}</h4>
          <div class="resource-item-actions">
            <span class="difficulty-badge ${difficultyClass}">
              ${question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
            <button class="resource-action" onclick="toggleQuestionStatus('${question.id}')">
              <i class="fas ${question.isSolved ? "fa-check-circle" : "fa-circle"}"></i>
            </button>
            <button class="resource-action" onclick="openModal('question', '${question.id}')">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
        <div class="resource-item-content">
          ${
            question.answer
              ? `
            <div class="question-answer ${!question.isSolved ? "hidden-answer" : ""}">
              <h5>Answer:</h5>
              <p>${question.answer}</p>
              ${
                !question.isSolved
                  ? `
                <button class="btn btn-small" onclick="toggleQuestionAnswer('${question.id}')">
                  <i class="fas fa-eye"></i> Show Answer
                </button>
              `
                  : ""
              }
            </div>
          `
              : ""
          }
        </div>
      </div>
    `
  })

  html += `
    </div>
    <div class="resource-modal-footer">
      <button class="btn" onclick="openModal('question', null, '${topicId}')">
        <i class="fas fa-plus"></i> Add Question
      </button>
    </div>
  `

  const resourceModal = document.getElementById("resource-modal")
  resourceModal.innerHTML = html
  resourceModal.style.display = "block"

  document.querySelector(".close-resource").addEventListener("click", () => {
    resourceModal.style.display = "none"
  })
}

// Show topic doubts
function showTopicDoubts(topicId) {
  const doubts = appData.doubts.filter((d) => d.syllabusId === topicId)
  const syllabusItem = appData.syllabus.find((s) => s.id === topicId)

  if (!doubts.length || !syllabusItem) return

  const subject = appData.subjects.find((s) => s.id === syllabusItem.subjectId)

  let html = `
    <div class="resource-modal-header">
      <h3>Doubts for ${subject ? subject.name : "Unknown Subject"} - ${syllabusItem.topic}</h3>
      <span class="close-resource">&times;</span>
    </div>
    <div class="resource-modal-content">
  `

  doubts.forEach((doubt) => {
    const statusClass = doubt.status === "solved" ? "doubt-solved" : "doubt-unsolved"

    html += `
      <div class="resource-item ${statusClass}">
        <div class="resource-item-header">
          <h4>${doubt.question}</h4>
          <div class="resource-item-actions">
            <span class="doubt-status-badge ${statusClass}">
              ${doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
            </span>
            <button class="resource-action" onclick="toggleDoubtStatus('${doubt.id}')">
              <i class="fas ${doubt.status === "solved" ? "fa-check-circle" : "fa-question-circle"}"></i>
            </button>
            <button class="resource-action" onclick="openModal('doubt', '${doubt.id}')">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
        <div class="resource-item-content">
          ${
            doubt.solution
              ? `
            <div class="doubt-solution">
              <h5>Solution:</h5>
              <p>${doubt.solution}</p>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `
  })

  html += `
    </div>
    <div class="resource-modal-footer">
      <button class="btn" onclick="openModal('doubt', null, '${topicId}')">
        <i class="fas fa-plus"></i> Add Doubt
      </button>
    </div>
  `

  const resourceModal = document.getElementById("resource-modal")
  resourceModal.innerHTML = html
  resourceModal.style.display = "block"

  document.querySelector(".close-resource").addEventListener("click", () => {
    resourceModal.style.display = "none"
  })
}

// Toggle question answer visibility
function toggleQuestionAnswer(questionId) {
  const answerElement = document.querySelector(`.question-answer[data-id="${questionId}"]`)
  if (answerElement) {
    answerElement.classList.toggle("hidden-answer")
  }
}

// Study timer functionality
let studyTimerInterval
let studyTimerRunning = false
let studyTimerSeconds = 0
let currentTopicId = null

function startStudyTimer(topicId) {
  if (studyTimerRunning) return

  currentTopicId = topicId || currentTopicId

  if (!currentTopicId) {
    alert("Please select a topic to track study time")
    return
  }

  const timerDisplay = document.getElementById("timer-display")
  const topicElement = document.getElementById("timer-topic")

  if (topicElement) {
    const syllabusItem = appData.syllabus.find((s) => s.id === currentTopicId)
    if (syllabusItem) {
      const subject = appData.subjects.find((s) => s.id === syllabusItem.subjectId)
      topicElement.textContent = `${subject ? subject.name : "Unknown"} - ${syllabusItem.topic}`
    }
  }

  studyTimerRunning = true
  document.getElementById("start-timer-btn").disabled = true
  document.getElementById("pause-timer-btn").disabled = false
  document.getElementById("stop-timer-btn").disabled = false

  studyTimerInterval = setInterval(() => {
    studyTimerSeconds++
    if (timerDisplay) {
      timerDisplay.textContent = formatTime(studyTimerSeconds)
    }
  }, 1000)
}

function pauseStudyTimer() {
  if (!studyTimerRunning) return

  clearInterval(studyTimerInterval)
  studyTimerRunning = false
  document.getElementById("start-timer-btn").disabled = false
  document.getElementById("pause-timer-btn").disabled = true
}

function stopStudyTimer() {
  if (!currentTopicId) return

  clearInterval(studyTimerInterval)
  studyTimerRunning = false

  // Save the study session
  const newTimer = {
    id: generateId(),
    topicId: currentTopicId,
    duration: studyTimerSeconds,
    date: new Date().toISOString(),
  }

  appData.studyTimers.push(newTimer)
  saveData()

  // Reset timer
  studyTimerSeconds = 0
  currentTopicId = null

  const timerDisplay = document.getElementById("timer-display")
  const topicElement = document.getElementById("timer-topic")

  if (timerDisplay) timerDisplay.textContent = "00:00:00"
  if (topicElement) topicElement.textContent = "No topic selected"

  document.getElementById("start-timer-btn").disabled = false
  document.getElementById("pause-timer-btn").disabled = true
  document.getElementById("stop-timer-btn").disabled = true

  // Update the study time stats
  updateStudyTimeStats()
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function updateStudyTimeStats() {
  const statsElement = document.getElementById("study-time-stats")
  if (!statsElement) return

  // Calculate total study time
  const totalSeconds = appData.studyTimers.reduce((total, timer) => total + timer.duration, 0)

  // Calculate study time per subject
  const subjectTimes = {}

  appData.studyTimers.forEach((timer) => {
    const syllabusItem = appData.syllabus.find((s) => s.id === timer.topicId)
    if (!syllabusItem) return

    const subjectId = syllabusItem.subjectId
    if (!subjectTimes[subjectId]) {
      subjectTimes[subjectId] = 0
    }

    subjectTimes[subjectId] += timer.duration
  })

  // Generate HTML
  let html = `
    <div class="study-time-total">
      <h3>Total Study Time</h3>
      <p>${formatTime(totalSeconds)}</p>
    </div>
    <div class="study-time-subjects">
      <h3>Time by Subject</h3>
  `

  Object.entries(subjectTimes).forEach(([subjectId, seconds]) => {
    const subject = appData.subjects.find((s) => s.id === subjectId)
    if (!subject) return

    const percentage = Math.round((seconds / totalSeconds) * 100) || 0

    html += `
      <div class="study-time-subject">
        <div class="subject-time-header">
          <h4>${subject.name}</h4>
          <span>${formatTime(seconds)}</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${percentage}%; background-color: ${subject.color}"></div>
        </div>
      </div>
    `
  })

  html += `</div>`

  statsElement.innerHTML = html
}

function deleteItem(type, id) {
  if (confirm(`Are you sure you want to delete this ${type}?`)) {
    const pluralType = `${type}s`

    appData[pluralType] = appData[pluralType].filter((item) => item.id !== id)

    if (type === "subject") {
      appData.assignments = appData.assignments.filter((a) => a.subjectId !== id)
      appData.exams = appData.exams.filter((e) => e.subjectId !== id)
      appData.goals = appData.goals.filter((g) => g.subjectId !== id)
      appData.syllabus = appData.syllabus.filter((s) => s.subjectId !== id)

      // Also delete related resources
      const syllabusIds = appData.syllabus.filter((s) => s.subjectId === id).map((s) => s.id)
      appData.practiceQuestions = appData.practiceQuestions.filter((q) => !syllabusIds.includes(q.syllabusId))
      appData.videoLectures = appData.videoLectures.filter((v) => !syllabusIds.includes(v.syllabusId))
      appData.doubts = appData.doubts.filter((d) => !syllabusIds.includes(d.syllabusId))
    }

    if (type === "syllabus") {
      // Delete related resources
      appData.practiceQuestions = appData.practiceQuestions.filter((q) => q.syllabusId !== id)
      appData.videoLectures = appData.videoLectures.filter((v) => v.syllabusId !== id)
      appData.doubts = appData.doubts.filter((d) => d.syllabusId !== id)
    }

    saveData()

    switch (type) {
      case "subject":
        loadSubjects()
        loadAssignments()
        loadExams()
        loadGoals()
        loadSyllabus()
        loadPracticeQuestions()
        loadVideoLectures()
        loadDoubts()
        break
      case "assignment":
        loadAssignments()
        break
      case "exam":
        loadExams()
        updateExamsCountdown()
        break
      case "goal":
        loadGoals()
        break
      case "syllabus":
        loadSyllabus()
        loadPracticeQuestions()
        loadVideoLectures()
        loadDoubts()
        loadSubjects() // Update subject cards with new completion percentages
        break
      case "practiceQuestion":
        loadPracticeQuestions()
        break
      case "videoLecture":
        loadVideoLectures()
        break
      case "doubt":
        loadDoubts()
        break
    }

    updateStats()
  }
}

function updateStats() {
  document.getElementById("subject-count").textContent = appData.subjects.length
  document.getElementById("assignment-count").textContent = appData.assignments.length
  document.getElementById("exam-count").textContent = appData.exams.length
  document.getElementById("goal-count").textContent = appData.goals.length

  // Update syllabus stats if element exists
  const syllabusCountElement = document.getElementById("syllabus-count")
  if (syllabusCountElement) {
    syllabusCountElement.textContent = appData.syllabus.length
  }

  // Update completion stats
  const completedTopicsElement = document.getElementById("completed-topics")
  if (completedTopicsElement) {
    const completedTopics = appData.syllabus.filter((item) => item.isCompleted).length
    const totalTopics = appData.syllabus.length
    const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

    completedTopicsElement.textContent = `${completedTopics}/${totalTopics} (${completionPercentage}%)`
  }

  // Update important topics count
  const importantTopicsElement = document.getElementById("important-topics")
  if (importantTopicsElement) {
    const importantTopics = appData.syllabus.filter((item) => item.isImportant).length
    importantTopicsElement.textContent = importantTopics
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

function formatDateTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatDateForInput(dateString) {
  const date = new Date(dateString)
  return date.toISOString().split("T")[0]
}

function formatDateTimeForInput(dateString) {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

function getCountdown(dateString) {
  const targetDate = new Date(dateString)
  const now = new Date()
  const diff = targetDate - now

  if (diff <= 0) {
    return "Exam has passed"
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""} ${hours} hr${hours !== 1 ? "s" : ""}`
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}`
  } else {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`
  }
}
