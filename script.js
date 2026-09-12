/* =========================================================
   THE PAPER NEST
   Complete Dashboard JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       DATA
       ===================================================== */

    const defaultData = {
        tasks: [
            {
                id: 1,
                title: "Complete assignment",
                time: "12:00",
                subject: "Data Science",
                priority: "High",
                completed: false
            },
            {
                id: 2,
                title: "Study Data Structures",
                time: "15:00",
                subject: "Java",
                priority: "Normal",
                completed: false
            },
            {
                id: 3,
                title: "Work on Mini Project",
                time: "17:00",
                subject: "Research",
                priority: "High",
                completed: false
            },
            {
                id: 4,
                title: "Review notes",
                time: "19:00",
                subject: "General",
                priority: "Low",
                completed: false
            }
        ],

        notes: [
            {
                id: 1,
                title: "Ideas for my project",
                content:
                    "• Add a better progress tracker\n" +
                    "• Make the planner feel more personal\n" +
                    "• Keep the design calm and simple"
            },
            {
                id: 2,
                title: "Things to remember",
                content:
                    "Take breaks.\n\n" +
                    "Drink water.\n\n" +
                    "Finish one thing before jumping to another."
            },
            {
                id: 3,
                title: "This week's focus",
                content:
                    "Learn consistently.\n\n" +
                    "Keep my tasks realistic.\n\n" +
                    "Celebrate the small wins."
            }
        ],

        subjects: [
            {
                name: "Data Science",
                progress: 78
            },
            {
                name: "Java",
                progress: 65
            },
            {
                name: "Web Development",
                progress: 84
            },
            {
                name: "Mathematics",
                progress: 58
            },
            {
                name: "Research",
                progress: 72
            }
        ]
    };


    /* =====================================================
       LOAD SAVED DATA
       ===================================================== */

    let data;

    try {

        const saved =
            localStorage.getItem("paperNestData");

        if (saved) {

            data = JSON.parse(saved);

        } else {

            data =
                JSON.parse(
                    JSON.stringify(defaultData)
                );

        }

    } catch (error) {

        console.error(
            "Could not load Paper Nest data:",
            error
        );

        data =
            JSON.parse(
                JSON.stringify(defaultData)
            );

    }


    /* Make sure arrays exist */

    if (!Array.isArray(data.tasks)) {
        data.tasks = [];
    }

    if (!Array.isArray(data.notes)) {
        data.notes = [];
    }

    if (!Array.isArray(data.subjects)) {
        data.subjects = [];
    }


    /* =====================================================
       SAVE DATA
       ===================================================== */

    function saveData() {

        localStorage.setItem(
            "paperNestData",
            JSON.stringify(data)
        );

    }


    /* =====================================================
       HELPER - FIND ELEMENT
       ===================================================== */

    function getElement(...ids) {

        for (const id of ids) {

            const element =
                document.getElementById(id);

            if (element) {
                return element;
            }

        }

        return null;

    }


    /* =====================================================
       HELPER - SET TEXT
       ===================================================== */

    function setText(ids, value) {

        const idList =
            Array.isArray(ids)
                ? ids
                : [ids];

        const element =
            getElement(...idList);

        if (element) {
            element.textContent = value;
        }

    }


    /* =====================================================
       HTML SECURITY
       ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       NAVIGATION
       ===================================================== */

    const navItems =
        document.querySelectorAll(
            ".nav-item[data-page], .nav-item[data-section]"
        );

    const pages =
        document.querySelectorAll(".page");


    function openPage(pageName) {

        pages.forEach(function (page) {

            page.classList.remove(
                "active-page"
            );

        });


        const selectedPage =
            document.getElementById(pageName);


        if (selectedPage) {

            selectedPage.classList.add(
                "active-page"
            );

        }


        navItems.forEach(function (item) {

            const itemPage =
                item.dataset.page ||
                item.dataset.section;

            item.classList.toggle(
                "active",
                itemPage === pageName
            );

        });


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    navItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                const page =
                    item.dataset.page ||
                    item.dataset.section;

                if (page) {
                    openPage(page);
                }

            }
        );

    });


    /* Other buttons that navigate */

    document
        .querySelectorAll(
            "[data-page-link], [data-section-jump]"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const page =
                        button.dataset.pageLink ||
                        button.dataset.sectionJump;

                    if (page) {
                        openPage(page);
                    }

                }
            );

        });


    /* Make available to HTML */

    window.openPage = openPage;


    /* =====================================================
       DATE
       ===================================================== */

    function displayDate() {

        const date =
            new Date();

        const formatted =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                }
            ).toUpperCase();


        setText(
            ["currentDate", "todayLabel"],
            formatted
        );

    }


    displayDate();


    /* =====================================================
       TASK HTML
       ===================================================== */

    function createTaskHTML(task) {

        return `

            <div class="task ${
                task.completed
                    ? "completed"
                    : ""
            }">

                <button
                    class="check-btn"
                    type="button"
                    onclick="toggleTask(${task.id})"
                    title="Complete task"
                >

                    ${
                        task.completed
                            ? "✓"
                            : ""
                    }

                </button>


                <div class="task-info">

                    <div class="task-name">

                        ${escapeHTML(task.title)}

                    </div>


                    <div class="task-meta">

                        ${
                            task.time ||
                            "Anytime"
                        }

                        •

                        ${
                            escapeHTML(
                                task.subject ||
                                "General"
                            )
                        }

                    </div>

                </div>


                <span
                    class="priority ${
                        task.priority === "High"
                            ? "high"
                            : ""
                    }"
                >

                    ${
                        escapeHTML(
                            task.priority ||
                            "Normal"
                        )
                    }

                </span>


                <button
                    class="task-action delete-task-btn"
                    type="button"
                    onclick="deleteTask(${task.id})"
                    title="Delete task"
                >

                    🗑️

                </button>

            </div>

        `;

    }


    /* =====================================================
       RENDER TASKS
       ===================================================== */

    function renderTasks() {

        const homeContainer =
            getElement("homeTasks");

        const plannerContainer =
            getElement("plannerTasks");


        if (homeContainer) {

            if (data.tasks.length === 0) {

                homeContainer.innerHTML =
                    emptyMessage(
                        "Your day is a blank page. Add your first task."
                    );

            } else {

                homeContainer.innerHTML =
                    data.tasks
                        .slice(0, 5)
                        .map(createTaskHTML)
                        .join("");

            }

        }


        if (plannerContainer) {

            if (data.tasks.length === 0) {

                plannerContainer.innerHTML =
                    emptyMessage(
                        "Nothing planned yet. Add your first task."
                    );

            } else {

                plannerContainer.innerHTML =
                    data.tasks
                        .map(createTaskHTML)
                        .join("");

            }

        }


        updateStatistics();

    }


    /* =====================================================
       EMPTY MESSAGE
       ===================================================== */

    function emptyMessage(message) {

        return `

            <p style="
                color:#927a65;
                font-size:12px;
                padding:20px 0;
            ">

                ${escapeHTML(message)}

            </p>

        `;

    }


    /* =====================================================
       TOGGLE TASK
       ===================================================== */

    function toggleTask(id) {

        const task =
            data.tasks.find(function (task) {

                return String(task.id) ===
                       String(id);

            });


        if (!task) {
            return;
        }


        task.completed =
            !task.completed;


        saveData();

        renderTasks();

        renderProgress();

    }


    window.toggleTask =
        toggleTask;


    /* =====================================================
       DELETE TASK
       ===================================================== */

    function deleteTask(id) {

        const index =
            data.tasks.findIndex(function (task) {

                return String(task.id) ===
                       String(id);

            });


        if (index === -1) {

            console.error(
                "Task not found:",
                id
            );

            return;

        }


        const task =
            data.tasks[index];


        const confirmed =
            confirm(
                `Delete "${task.title}"?`
            );


        if (!confirmed) {
            return;
        }


        data.tasks.splice(
            index,
            1
        );


        saveData();

        renderTasks();

        renderProgress();

    }


    window.deleteTask =
        deleteTask;


    /* =====================================================
       STATISTICS
       ===================================================== */

    function updateStatistics() {

        const total =
            data.tasks.length;


        const completed =
            data.tasks.filter(function (task) {

                return task.completed;

            }).length;


        const pending =
            total - completed;


        const percentage =
            total === 0
                ? 0
                : Math.round(
                    (completed / total) *
                    100
                );


        setText(
            [
                "totalTasks",
                "todayCount"
            ],
            total
        );


        setText(
            [
                "completedTasks",
                "completedCount"
            ],
            completed
        );


        setText(
            [
                "pendingTasks",
                "pendingCount"
            ],
            pending
        );


        setText(
            [
                "productivity",
                "weekProgress"
            ],
            percentage + "%"
        );


        setText(
            [
                "circlePercentage",
                "overallPercentage",
                "overallPercent"
            ],
            percentage + "%"
        );


        updateCircle(
            percentage
        );

    }


    /* =====================================================
       PROGRESS CIRCLE
       ===================================================== */

    function updateCircle(percentage) {

        const circle =
            document.querySelector(
                ".progress-circle"
            );


        if (!circle) {
            return;
        }


        circle.style.background =
            `conic-gradient(
                var(--sage)
                ${percentage * 3.6}deg,
                #e6ddcf
                0deg
            )`;

    }


    /* =====================================================
       ADD TASK
       ===================================================== */

    const taskForm =
        getElement("taskForm");


    if (taskForm) {

        taskForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                /* Support both versions
                   of the task input ID */

                const titleInput =
                    getElement(
                        "taskTitle",
                        "taskName"
                    );


                const timeInput =
                    getElement(
                        "taskTime"
                    );


                const subjectInput =
                    getElement(
                        "taskSubject"
                    );


                const priorityInput =
                    getElement(
                        "taskPriority"
                    );


                const title =
                    titleInput
                        ? titleInput.value.trim()
                        : "";


                const time =
                    timeInput
                        ? timeInput.value
                        : "";


                const subject =
                    subjectInput
                        ? subjectInput.value
                        : "General";


                const priority =
                    priorityInput
                        ? priorityInput.value
                        : "Normal";


                if (!title) {

                    alert(
                        "Please enter a task."
                    );

                    if (titleInput) {
                        titleInput.focus();
                    }

                    return;

                }


                const newTask = {

                    id: Date.now(),

                    title: title,

                    time: time,

                    subject: subject,

                    priority: priority,

                    completed: false

                };


                data.tasks.push(
                    newTask
                );


                saveData();


                taskForm.reset();


                renderTasks();

                renderProgress();


                /* Keep user on Planner */

                openPage("planner");

            }
        );

    }


    /* =====================================================
       QUICK ADD BUTTON
       ===================================================== */

    const quickAdd =
        getElement(
            "quickAddBtn",
            "homeAddTask",
            "addTaskBtn",
            "newTaskButton"
        );


    if (quickAdd) {

        quickAdd.addEventListener(
            "click",
            function () {

                openPage("planner");


                setTimeout(
                    function () {

                        const input =
                            getElement(
                                "taskTitle",
                                "taskName"
                            );


                        if (input) {
                            input.focus();
                        }

                    },
                    150
                );

            }
        );

    }


    /* =====================================================
       NOTES
       ===================================================== */

    const notesGrid =
        getElement(
            "notesGrid"
        );


    function renderNotes() {

        if (!notesGrid) {
            return;
        }


        if (data.notes.length === 0) {

            notesGrid.innerHTML =
                emptyMessage(
                    "No notes yet. Start writing."
                );

            return;

        }


        notesGrid.innerHTML =
            data.notes
                .map(
                    function (note, index) {

                        return `

                            <article
                                class="paper-card note-card"
                            >

                                <div style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:center;
                                ">

                                    <p class="small-heading">

                                        NOTE ${
                                            String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )
                                        }

                                    </p>


                                    <button
                                        type="button"
                                        class="note-delete"
                                        onclick="deleteNote(${note.id})"
                                        title="Delete note"
                                    >

                                        🗑️

                                    </button>

                                </div>


                                <h3>

                                    ${escapeHTML(
                                        note.title
                                    )}

                                </h3>


                                <p style="white-space:pre-line;">

                                    ${escapeHTML(
                                        note.content
                                    )}

                                </p>

                            </article>

                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       DELETE NOTE
       ===================================================== */

    function deleteNote(id) {

        const index =
            data.notes.findIndex(
                function (note) {

                    return String(note.id) ===
                           String(id);

                }
            );


        if (index === -1) {
            return;
        }


        const note =
            data.notes[index];


        const confirmed =
            confirm(
                `Delete "${note.title}"?`
            );


        if (!confirmed) {
            return;
        }


        data.notes.splice(
            index,
            1
        );


        saveData();

        renderNotes();

    }


    window.deleteNote =
        deleteNote;


    /* =====================================================
       NOTE MODAL
       ===================================================== */

    const noteModal =
        getElement(
            "noteModal"
        );


    const newNoteButton =
        getElement(
            "newNoteBtn",
            "newNoteButton"
        );


    const closeNoteButton =
        getElement(
            "closeNote"
        );


    const saveNoteButton =
        getElement(
            "saveNote"
        );


    /* Open modal */

    if (
        newNoteButton &&
        noteModal
    ) {

        newNoteButton.addEventListener(
            "click",
            function () {

                noteModal.classList.add(
                    "show"
                );


                const titleInput =
                    getElement(
                        "noteTitle"
                    );


                if (titleInput) {
                    titleInput.focus();
                }

            }
        );

    }


    /* Close modal */

    function closeNote() {

        if (noteModal) {

            noteModal.classList.remove(
                "show"
            );

        }

    }


    if (closeNoteButton) {

        closeNoteButton.addEventListener(
            "click",
            closeNote
        );

    }


    if (noteModal) {

        noteModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    noteModal
                ) {

                    closeNote();

                }

            }
        );

    }


    /* Save note */

    if (saveNoteButton) {

        saveNoteButton.addEventListener(
            "click",
            function () {

                const titleInput =
                    getElement(
                        "noteTitle"
                    );


                const contentInput =
                    getElement(
                        "noteBody",
                        "noteContent"
                    );


                const title =
                    titleInput
                        ? titleInput.value.trim()
                        : "";


                const content =
                    contentInput
                        ? contentInput.value.trim()
                        : "";


                if (!title && !content) {

                    alert(
                        "Please write something first."
                    );

                    return;

                }


                data.notes.unshift({

                    id: Date.now(),

                    title:
                        title ||
                        "Untitled Note",

                    content:
                        content ||
                        ""

                });


                saveData();

                renderNotes();


                if (titleInput) {
                    titleInput.value = "";
                }


                if (contentInput) {
                    contentInput.value = "";
                }


                closeNote();

            }
        );

    }


    /* =====================================================
       SUBJECTS
       ===================================================== */

    function renderSubjects() {

        const container =
            getElement(
                "subjectsGrid"
            );


        if (!container) {
            return;
        }


        if (data.subjects.length === 0) {

            container.innerHTML =
                emptyMessage(
                    "No subjects added yet."
                );

            return;

        }


        container.innerHTML =
            data.subjects
                .map(
                    function (subject) {

                        return `

                            <div
                                class="paper-card subject-card"
                            >

                                <div
                                    class="subject-header"
                                >

                                    <h3>

                                        ${escapeHTML(
                                            subject.name
                                        )}

                                    </h3>


                                    <span
                                        class="subject-percent"
                                    >

                                        ${
                                            subject.progress
                                        }%

                                    </span>

                                </div>


                                <div
                                    class="progress-bar"
                                >

                                    <span
                                        style="
                                            width:
                                            ${subject.progress}%;
                                        "
                                    ></span>

                                </div>


                                <small>

                                    Keep nurturing this
                                    subject 🌱

                                </small>

                            </div>

                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       PROGRESS PAGE
       ===================================================== */

    function renderProgress() {

        const total =
            data.tasks.length;


        const completed =
            data.tasks.filter(
                function (task) {
                    return task.completed;
                }
            ).length;


        const percentage =
            total === 0
                ? 0
                : Math.round(
                    completed /
                    total *
                    100
                );


        setText(
            [
                "overallPercentage",
                "overallPercent"
            ],
            percentage + "%"
        );


        setText(
            "allCompleted",
            completed
        );


        const bar =
            getElement(
                "overallBar"
            );


        if (bar) {

            bar.style.width =
                percentage + "%";

        }


        const container =
            getElement(
                "subjectProgress",
                "progressSubjects"
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            data.subjects
                .map(
                    function (subject) {

                        return `

                            <div
                                class="subject-progress-row"
                            >

                                <strong>

                                    ${escapeHTML(
                                        subject.name
                                    )}

                                </strong>


                                <div
                                    class="progress-bar"
                                >

                                    <span
                                        style="
                                            width:
                                            ${subject.progress}%;
                                        "
                                    ></span>

                                </div>


                                <span>

                                    ${
                                        subject.progress
                                    }%

                                </span>

                            </div>

                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       CALENDAR
       ===================================================== */

    let calendarDate =
        new Date();


    function renderCalendar() {

        const calendar =
            getElement(
                "calendar"
            );


        const monthTitle =
            getElement(
                "monthTitle"
            );


        if (!calendar) {

            console.error(
                "Calendar container not found."
            );

            return;

        }


        const year =
            calendarDate.getFullYear();


        const month =
            calendarDate.getMonth();


        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();


        const numberOfDays =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        if (monthTitle) {

            monthTitle.textContent =
                new Date(
                    year,
                    month,
                    1
                ).toLocaleDateString(
                    "en-US",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );

        }


        let html = "";


        /* Weekdays */

        const weekdays = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
        ];


        weekdays.forEach(
            function (day) {

                html += `
                    <div class="day">
                        ${day}
                    </div>
                `;

            }
        );


        /* Empty cells */

        for (
            let i = 0;
            i < firstDay;
            i++
        ) {

            html += `
                <div></div>
            `;

        }


        /* Dates */

        const today =
            new Date();


        for (
            let day = 1;
            day <= numberOfDays;
            day++
        ) {

            const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();


            html += `

                <div
                    class="date ${
                        isToday
                            ? "today"
                            : ""
                    }"
                >

                    ${day}

                </div>

            `;

        }


        calendar.innerHTML =
            html;

    }


    /* Previous month */

    const previousMonth =
        getElement(
            "prevMonth",
            "previousMonth"
        );


    if (previousMonth) {

        previousMonth.addEventListener(
            "click",
            function () {

                calendarDate.setMonth(
                    calendarDate.getMonth() - 1
                );

                renderCalendar();

            }
        );

    }


    /* Next month */

    const nextMonth =
        getElement(
            "nextMonth"
        );


    if (nextMonth) {

        nextMonth.addEventListener(
            "click",
            function () {

                calendarDate.setMonth(
                    calendarDate.getMonth() + 1
                );

                renderCalendar();

            }
        );

    }


    /* =====================================================
       PROFILE / ACCOUNT
       ===================================================== */

    const profileButton =
        getElement(
            "profileButton",
            "profileBtn"
        );


    const profilePanel =
        getElement(
            "profilePanel"
        );


    if (
        profileButton &&
        profilePanel
    ) {

        profileButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                profilePanel.classList.toggle(
                    "show"
                );

            }
        );


        profilePanel.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

            }
        );


        document.addEventListener(
            "click",
            function () {

                profilePanel.classList.remove(
                    "show"
                );

            }
        );

    }


    /* =====================================================
       LOAD ACCOUNT
       ===================================================== */

    function loadAccount() {

        const savedUser =
            localStorage.getItem(
                "paperNestUser"
            );


        if (!savedUser) {
            return;
        }


        let user;

        try {

            user =
                JSON.parse(
                    savedUser
                );

        } catch (error) {

            return;

        }


        if (!user) {
            return;
        }


        const profileName =
            getElement(
                "profileName"
            );


        const profileAvatar =
            getElement(
                "profileAvatar"
            );


        const accountName =
            getElement(
                "accountName"
            );


        const accountEmail =
            getElement(
                "accountEmail"
            );


        if (profileName) {

            profileName.textContent =
                user.name || "User";

        }


        if (profileAvatar) {

            profileAvatar.textContent =
                (
                    user.name ||
                    "U"
                )
                .charAt(0)
                .toUpperCase();

        }


        if (accountName) {

            accountName.textContent =
                user.name || "User";

        }


        if (accountEmail) {

            accountEmail.textContent =
                user.email || "";

        }

    }


    loadAccount();


    /* =====================================================
       LOGOUT
       ===================================================== */

    const logoutButton =
        getElement(
            "logoutBtn",
            "profileLogout"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                const confirmed =
                    confirm(
                        "Are you sure you want to log out?"
                    );


                if (confirmed) {

                    window.location.href =
                        "login.html";

                }

            }
        );

    }


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    renderTasks();

    renderNotes();

    renderSubjects();

    renderProgress();

    renderCalendar();

});