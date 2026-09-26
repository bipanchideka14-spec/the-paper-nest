/* =========================================================
   THE PAPER NEST
   DASHBOARD JAVASCRIPT
   ========================================================= */


/* =========================================================
   API URLS
   ========================================================= */

const API_URL = "https://the-paper-nest.onrender.com/api/tasks";
const AUTH_API_URL = "https://the-paper-nest.onrender.com/api/auth";


/* =========================================================
   DEFAULT DATA
   ========================================================= */

const defaultData = {

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


/* =========================================================
   LOCAL DATA
   NOTES + SUBJECTS
   ========================================================= */

let data = {
    tasks: [],
    notes: [],
    subjects: []
};


try {

    const savedData =
        localStorage.getItem("paperNestData");

    if (savedData) {

        const parsed =
            JSON.parse(savedData);

        data.notes =
            Array.isArray(parsed.notes)
                ? parsed.notes
                : defaultData.notes;

        data.subjects =
            Array.isArray(parsed.subjects)
                ? parsed.subjects
                : defaultData.subjects;

    } else {

        data.notes = defaultData.notes;
        data.subjects = defaultData.subjects;

    }

} catch (error) {

    console.error(
        "Error loading local data:",
        error
    );

    data.notes = defaultData.notes;
    data.subjects = defaultData.subjects;

}


/* =========================================================
   SAVE LOCAL DATA
   ========================================================= */

function saveLocalData() {

    try {

        localStorage.setItem(
            "paperNestData",
            JSON.stringify({
                notes: data.notes,
                subjects: data.subjects
            })
        );

    } catch (error) {

        console.error(
            "Unable to save local data:",
            error
        );

    }

}


/* =========================================================
   ELEMENT HELPER
   ========================================================= */

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


/* =========================================================
   HTML SECURITY
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   AUTHENTICATION
   ========================================================= */

function checkLogin() {

    const token =
        localStorage.getItem(
            "paperNestToken"
        );

    console.log(
        "Paper Nest token exists:",
        !!token
    );

    if (!token) {

        console.warn(
            "No login token found."
        );

        window.location.href =
            "/login";

        return false;
    }

    return true;

}


/* =========================================================
   LOAD ACCOUNT
   ========================================================= */

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
            JSON.parse(savedUser);

    } catch (error) {

        console.error(
            "Account data error:",
            error
        );

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


    if (
        profileName &&
        user.name
    ) {

        profileName.textContent =
            user.name;

    }


    if (
        profileAvatar &&
        user.name
    ) {

        profileAvatar.textContent =
            user.name
                .charAt(0)
                .toUpperCase();

    }


    if (
        accountName &&
        user.name
    ) {

        accountName.textContent =
            user.name;

    }


    if (
        accountEmail &&
        user.email
    ) {

        accountEmail.textContent =
            user.email;

    }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

const navItems =
    document.querySelectorAll(
        ".nav-item[data-page]"
    );

const pages =
    document.querySelectorAll(
        ".page"
    );


function openPage(pageName) {

    pages.forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    const selectedPage =
        document.getElementById(
            pageName
        );


    if (selectedPage) {

        selectedPage.classList.add(
            "active-page"
        );

    }


    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );

    });


    if (pageName === "planner") {

        renderTasks();

    }


    if (pageName === "notes") {

        renderNotes();

    }


    if (pageName === "subjects") {

        renderSubjects();

    }


    if (pageName === "progress") {

        renderProgress();

    }


    if (pageName === "home") {

        renderTasks();
        renderProgress();

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


window.openPage =
    openPage;


navItems.forEach(item => {

    item.addEventListener(
        "click",
        function () {

            openPage(
                item.dataset.page
            );

        }
    );

});


document
    .querySelectorAll(
        "[data-page-link]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                openPage(
                    button.dataset.pageLink
                );

            }
        );

    });


/* =========================================================
   CURRENT DATE
   ========================================================= */

function displayDate() {

    const currentDate =
        getElement(
            "currentDate"
        );

    if (!currentDate) {
        return;
    }


    const today =
        new Date();


    currentDate.textContent =
        today
            .toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                }
            )
            .toUpperCase();

}


displayDate();


/* =========================================================
   TASK API
   ========================================================= */

async function loadTasks() {

    try {

        console.log(
            "Loading tasks from MongoDB..."
        );


        const token =
            localStorage.getItem(
                "paperNestToken"
            );


        const response =
            await fetch(
                API_URL,
                {
                    headers: token
                        ? {
                            "Authorization":
                                `Bearer ${token}`
                        }
                        : {}
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load tasks"
            );

        }


        const tasks =
            await response.json();


        data.tasks =
            Array.isArray(tasks)
                ? tasks
                : [];


        console.log(
            "Tasks loaded:",
            data.tasks
        );


        renderTasks();
        renderProgress();
        updateStatistics();


    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        data.tasks = [];

        renderTasks();
        renderProgress();
        updateStatistics();

    }

}


/* =========================================================
   CREATE TASK
   ========================================================= */

async function createTask(taskData) {

    try {

        const token =
            localStorage.getItem(
                "paperNestToken"
            );


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                            : {})
                    },

                    body:
                        JSON.stringify(
                            taskData
                        )
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to create task"
            );

        }


        const task =
            await response.json();


        data.tasks.push(task);


        renderTasks();
        renderProgress();
        updateStatistics();


        return task;


    } catch (error) {

        console.error(
            "Could not create task:",
            error
        );

        alert(
            "Could not connect to the server."
        );

        return null;

    }

}


/* =========================================================
   UPDATE TASK
   ========================================================= */

async function updateTask(
    taskId,
    updates
) {

    try {

        const token =
            localStorage.getItem(
                "paperNestToken"
            );


        const response =
            await fetch(
                `${API_URL}/${taskId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                            : {})
                    },

                    body:
                        JSON.stringify(
                            updates
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to update task"
            );

        }


        const updatedTask =
            await response.json();


        const index =
            data.tasks.findIndex(
                task =>
                    String(task._id) ===
                    String(taskId) ||
                    String(task.id) ===
                    String(taskId)
            );


        if (index !== -1) {

            data.tasks[index] =
                updatedTask;

        }


        renderTasks();
        renderProgress();
        updateStatistics();


        return updatedTask;


    } catch (error) {

        console.error(
            "Could not update task:",
            error
        );

        alert(
            "Could not update the task."
        );

        return null;

    }

}


/* =========================================================
   DELETE TASK
   ========================================================= */

async function deleteTask(taskId) {

    try {

        const token =
            localStorage.getItem(
                "paperNestToken"
            );


        const response =
            await fetch(
                `${API_URL}/${taskId}`,
                {
                    method: "DELETE",

                    headers: token
                        ? {
                            "Authorization":
                                `Bearer ${token}`
                        }
                        : {}
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete task"
            );

        }


        data.tasks =
            data.tasks.filter(
                task =>
                    String(task._id) !==
                    String(taskId) &&
                    String(task.id) !==
                    String(taskId)
            );


        renderTasks();
        renderProgress();
        updateStatistics();


    } catch (error) {

        console.error(
            "Could not delete task:",
            error
        );

        alert(
            "Could not delete the task."
        );

    }

}


/* =========================================================
   TOGGLE TASK
   ========================================================= */

async function toggleTask(
    taskId,
    completed
) {

    return updateTask(
        taskId,
        {
            completed:
                completed
        }
    );

}


/* =========================================================
   TASK RENDERING
   ========================================================= */

function renderTasks() {

    const container =
        getElement(
            "tasksContainer",
            "taskList",
            "tasksList"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(data.tasks) ||
        data.tasks.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No tasks yet</h3>
                <p>Start building your productive little space.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        data.tasks
            .map(
                task => {

                    const taskId =
                        task._id ||
                        task.id;

                    const completed =
                        !!task.completed;


                    return `

                        <div
                            class="task-card ${
                                completed
                                    ? "completed"
                                    : ""
                            }"
                            data-task-id="${escapeHTML(taskId)}"
                        >

                            <div
                                class="task-check ${
                                    completed
                                        ? "checked"
                                        : ""
                                }"
                                onclick="handleTaskToggle('${escapeHTML(taskId)}', ${!completed})"
                            >
                                ${
                                    completed
                                        ? "✓"
                                        : ""
                                }
                            </div>


                            <div
                                class="task-content"
                            >

                                <h3>
                                    ${escapeHTML(
                                        task.title
                                    )}
                                </h3>


                                ${
                                    task.description
                                        ? `
                                            <p>
                                                ${escapeHTML(
                                                    task.description
                                                )}
                                            </p>
                                          `
                                        : ""
                                }


                                <div
                                    class="task-meta"
                                >

                                    ${
                                        task.category
                                            ? `
                                                <span>
                                                    ${escapeHTML(
                                                        task.category
                                                    )}
                                                </span>
                                              `
                                            : ""
                                    }


                                    ${
                                        task.priority
                                            ? `
                                                <span>
                                                    ${escapeHTML(
                                                        task.priority
                                                    )}
                                                </span>
                                              `
                                            : ""
                                    }


                                    ${
                                        task.dueDate
                                            ? `
                                                <span>
                                                    ${escapeHTML(
                                                        new Date(
                                                            task.dueDate
                                                        ).toLocaleDateString()
                                                    )}
                                                </span>
                                              `
                                            : ""
                                    }

                                </div>

                            </div>


                            <button
                                class="delete-task"
                                onclick="handleTaskDelete('${escapeHTML(taskId)}')"
                                aria-label="Delete task"
                            >
                                🗑️
                            </button>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   TASK HANDLERS
   ========================================================= */

window.handleTaskToggle =
    async function (
        taskId,
        completed
    ) {

        await toggleTask(
            taskId,
            completed
        );

    };


window.handleTaskDelete =
    async function (
        taskId
    ) {

        const confirmed =
            confirm(
                "Delete this task?"
            );


        if (!confirmed) {
            return;
        }


        await deleteTask(
            taskId
        );

    };


/* =========================================================
   TASK MODAL
   ========================================================= */

const addTaskButton =
    getElement(
        "addTaskBtn",
        "addTaskButton"
    );

const taskModal =
    getElement(
        "taskModal"
    );

const closeTaskModalButton =
    getElement(
        "closeTaskModal",
        "taskModalClose"
    );


function openTaskModal() {

    if (taskModal) {

        taskModal.classList.add(
            "show"
        );

    }

}


function closeTaskModal() {

    if (taskModal) {

        taskModal.classList.remove(
            "show"
        );

    }

}


window.openTaskModal =
    openTaskModal;

window.closeTaskModal =
    closeTaskModal;


if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        openTaskModal
    );

}


if (closeTaskModalButton) {

    closeTaskModalButton.addEventListener(
        "click",
        closeTaskModal
    );

}


/* =========================================================
   ADD TASK FORM
   ========================================================= */

const taskForm =
    getElement(
        "taskForm"
    );


if (taskForm) {

    taskForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const titleInput =
                getElement(
                    "taskTitle",
                    "title"
                );

            const descriptionInput =
                getElement(
                    "taskDescription",
                    "description"
                );

            const categoryInput =
                getElement(
                    "taskCategory",
                    "category"
                );

            const priorityInput =
                getElement(
                    "taskPriority",
                    "priority"
                );

            const dueDateInput =
                getElement(
                    "taskDueDate",
                    "dueDate"
                );


            const title =
                titleInput
                    ? titleInput.value.trim()
                    : "";


            if (!title) {

                alert(
                    "Please enter a task title."
                );

                return;

            }


            const taskData = {

                title,

                description:
                    descriptionInput
                        ? descriptionInput.value.trim()
                        : "",

                category:
                    categoryInput
                        ? categoryInput.value
                        : "",

                priority:
                    priorityInput
                        ? priorityInput.value
                        : "medium",

                dueDate:
                    dueDateInput
                        ? dueDateInput.value
                        : "",

                completed: false

            };


            const task =
                await createTask(
                    taskData
                );


            if (task) {

                taskForm.reset();

                closeTaskModal();

            }

        }
    );

}


/* =========================================================
   NOTES
   ========================================================= */

function renderNotes() {

    const container =
        getElement(
            "notesGrid",
            "notesContainer",
            "notesList"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(data.notes) ||
        data.notes.length === 0
    ) {

        container.innerHTML =
            emptyMessage(
                "No notes yet."
            );

        return;

    }


    container.innerHTML =
        data.notes
            .map(
                note => `

                    <div
                        class="paper-card note-card"
                    >

                        <div
                            class="note-card-header"
                        >

                            <h3>
                                ${escapeHTML(
                                    note.title
                                )}
                            </h3>


                            <button
                                class="delete-note"
                                onclick="deleteNote(${note.id})"
                            >
                                🗑️
                            </button>

                        </div>


                        <p>
                            ${escapeHTML(
                                note.content
                            ).replace(
                                /\n/g,
                                "<br>"
                            )}
                        </p>

                    </div>

                `
            )
            .join("");

}


function emptyMessage(message) {

    return `
        <div class="empty-state">
            <p>${escapeHTML(message)}</p>
        </div>
    `;

}


/* =========================================================
   DELETE NOTE
   ========================================================= */

window.deleteNote =
    function (noteId) {

        const confirmed =
            confirm(
                "Delete this note?"
            );


        if (!confirmed) {
            return;
        }


        data.notes =
            data.notes.filter(
                note =>
                    note.id !== noteId
            );


        saveLocalData();

        renderNotes();

    };


/* =========================================================
   NOTE MODAL
   ========================================================= */

const addNoteButton =
    getElement(
        "addNoteBtn",
        "addNoteButton"
    );

const noteModal =
    getElement(
        "noteModal"
    );

const closeNoteModalButton =
    getElement(
        "closeNoteModal",
        "noteModalClose"
    );


function openNoteModal() {

    if (noteModal) {

        noteModal.classList.add(
            "show"
        );

    }

}


function closeNoteModal() {

    if (noteModal) {

        noteModal.classList.remove(
            "show"
        );

    }

}


window.openNoteModal =
    openNoteModal;

window.closeNoteModal =
    closeNoteModal;


if (addNoteButton) {

    addNoteButton.addEventListener(
        "click",
        openNoteModal
    );

}


if (closeNoteModalButton) {

    closeNoteModalButton.addEventListener(
        "click",
        closeNoteModal
    );

}


/* =========================================================
   ADD NOTE
   ========================================================= */

const noteForm =
    getElement(
        "noteForm"
    );


if (noteForm) {

    noteForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const titleInput =
                getElement(
                    "noteTitle"
                );

            const contentInput =
                getElement(
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


            if (
                !title &&
                !content
            ) {

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
                    content

            });


            saveLocalData();

            renderNotes();


            if (titleInput) {
                titleInput.value = "";
            }


            if (contentInput) {
                contentInput.value = "";
            }


            closeNoteModal();

        }
    );

}


/* =========================================================
   SUBJECTS
   ========================================================= */

function renderSubjects() {

    const container =
        getElement(
            "subjectsGrid"
        );


    if (!container) {
        return;
    }


    if (
        data.subjects.length === 0
    ) {

        container.innerHTML =
            emptyMessage(
                "No subjects added yet."
            );

        return;

    }


    container.innerHTML =
        data.subjects
            .map(
                subject => `

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
                                ${subject.progress}%
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
                            Keep nurturing this subject 🌱
                        </small>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   PROGRESS
   ========================================================= */

function renderProgress() {

    const total =
        data.tasks.length;


    const completed =
        data.tasks.filter(
            task =>
                task.completed
        ).length;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed /
                    total) *
                100
            );


    const overallPercentage =
        getElement(
            "overallPercentage"
        );


    if (overallPercentage) {

        overallPercentage.textContent =
            percentage + "%";

    }


    const overallBar =
        getElement(
            "overallBar"
        );


    if (overallBar) {

        overallBar.style.width =
            percentage + "%";

    }


    const allCompleted =
        getElement(
            "allCompleted"
        );


    if (allCompleted) {

        allCompleted.textContent =
            completed;

    }


    const subjectProgress =
        getElement(
            "subjectProgress"
        );


    if (!subjectProgress) {
        return;
    }


    subjectProgress.innerHTML =
        data.subjects
            .map(
                subject => `

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
                            ${subject.progress}%
                        </span>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   CALENDAR
   ========================================================= */

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
        day => {

            html += `

                <div class="day">
                    ${day}
                </div>

            `;

        }
    );


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        html += `
            <div></div>
        `;

    }


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


/* =========================================================
   PREVIOUS MONTH
   ========================================================= */

const previousMonth =
    getElement(
        "previousMonth",
        "prevMonth"
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


/* =========================================================
   NEXT MONTH
   ========================================================= */

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


/* =========================================================
   PROFILE
   ========================================================= */

const profileButton =
    getElement(
        "profileButton"
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


/* =========================================================
   LOGOUT
   ========================================================= */

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


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                "paperNestToken"
            );

            localStorage.removeItem(
                "paperNestUser"
            );


            window.location.href =
                "/login";

        }
    );

}


/* =========================================================
   START APPLICATION
   ========================================================= */

console.log(
    "The Paper Nest dashboard.js loaded successfully."
);


/*
   Check login first.
*/

if (checkLogin()) {

    loadAccount();

    renderTasks();

    renderNotes();

    renderSubjects();

    renderProgress();

    renderCalendar();

    updateStatistics();

    loadTasks();

}