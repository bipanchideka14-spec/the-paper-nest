/* =========================================================
   THE PAPER NEST
   DASHBOARD JAVASCRIPT
   ========================================================= */


/* =========================================================
   API URLS
   ========================================================= */

const API_URL = "/api/tasks";
const AUTH_API_URL = "/api/auth";


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
        populateSubjectDropdown();

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

/*
   IMPORTANT:

   Login stores the JWT as:

   paperNestToken

   Dashboard reads the same token.

   We are NOT redirecting to login simply because
   the /me request fails.

   This allows the dashboard to open while we
   separately display the saved account information.
*/

function checkLogin() {

    const token =
        localStorage.getItem(
            "paperNestToken"
        );

    console.log(
        "Paper Nest token exists:",
        !!token
    );

    /*
       If there is no token, show login.
    */

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


    /*
       Re-render pages.
    */

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


/*
   LOAD TASKS FROM MONGODB
*/

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


    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        /*
           Don't redirect to login here.
           The dashboard itself should remain visible.
        */

        renderTasks();
        renderProgress();

    }

}


/* =========================================================
   CREATE TASK HTML
   ========================================================= */

function createTaskHTML(task) {

    const taskId =
        task._id || task.id;


    return `

        <div
            class="task-item ${
                task.completed
                    ? "completed"
                    : ""
            }"
            data-task-id="${escapeHTML(taskId)}"
        >

            <div class="task-left">

                <button
                    class="task-checkbox ${
                        task.completed
                            ? "completed"
                            : ""
                    }"
                    type="button"
                    onclick="toggleTask('${taskId}')"
                    title="Mark task complete"
                >
                    ${
                        task.completed
                            ? "✓"
                            : ""
                    }
                </button>


                <div class="task-details">

                    <h3 class="${
                        task.completed
                            ? "completed-task"
                            : ""
                    }">

                        ${escapeHTML(
                            task.title
                        )}

                    </h3>


                    <p>

                        ${
                            task.time ||
                            "Anytime"
                        }

                        ${
                            task.subject
                                ? " • " +
                                  escapeHTML(
                                      task.subject
                                  )
                                : ""
                        }

                    </p>

                </div>

            </div>


            <div class="task-right">

                <span
                    class="priority ${
                        task.priority === "High"
                            ? "high"
                            : ""
                    }"
                >

                    ${escapeHTML(
                        task.priority ||
                        "Normal"
                    )}

                </span>


                <button
                    class="task-delete"
                    type="button"
                    onclick="deleteTask('${taskId}')"
                    title="Delete task"
                    aria-label="Delete task"
                >
                    🗑️
                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   RENDER TASKS
   ========================================================= */

function renderTasks() {

    const homeTasks =
        getElement(
            "homeTasks"
        );

    const plannerTasks =
        getElement(
            "plannerTasks"
        );


    if (homeTasks) {

        if (
            data.tasks.length === 0
        ) {

            homeTasks.innerHTML =
                emptyMessage(
                    "Your day is a blank page. Add your first task."
                );

        } else {

            homeTasks.innerHTML =
                data.tasks
                    .slice(0, 5)
                    .map(
                        createTaskHTML
                    )
                    .join("");

        }

    }


    if (plannerTasks) {

        if (
            data.tasks.length === 0
        ) {

            plannerTasks.innerHTML =
                emptyMessage(
                    "Nothing planned yet. Add your first task."
                );

        } else {

            plannerTasks.innerHTML =
                data.tasks
                    .map(
                        createTaskHTML
                    )
                    .join("");

        }

    }


    updateStatistics();

}


/* =========================================================
   EMPTY MESSAGE
   ========================================================= */

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


/* =========================================================
   TOGGLE TASK
   ========================================================= */

async function toggleTask(id) {

    const task =
        data.tasks.find(
            task =>
                String(
                    task._id ||
                    task.id
                ) === String(id)
        );


    if (!task) {
        return;
    }


    /*
       If this is a MongoDB task,
       update it in MongoDB.
    */

    if (task._id) {

        try {

            const token =
                localStorage.getItem(
                    "paperNestToken"
                );


            const response =
                await fetch(
                    `${API_URL}/${id}`,
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
                            JSON.stringify({
                                completed:
                                    !task.completed
                            })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Could not update task"
                );

            }


            const result =
                await response.json();


            const index =
                data.tasks.findIndex(
                    item =>
                        String(
                            item._id
                        ) === String(id)
                );


            if (index !== -1) {

                data.tasks[index] =
                    result;

            }


        } catch (error) {

            console.error(
                "Error updating task:",
                error
            );

        }

    } else {

        /*
           Old/local task.
        */

        task.completed =
            !task.completed;

        saveLocalData();

    }


    renderTasks();
    renderProgress();

}


window.toggleTask =
    toggleTask;


/* =========================================================
   DELETE TASK
   ========================================================= */

async function deleteTask(id) {

    const task =
        data.tasks.find(
            task =>
                String(
                    task._id ||
                    task.id
                ) === String(id)
        );


    if (!task) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${task.title}"?`
        );


    if (!confirmed) {
        return;
    }


    /*
       MongoDB task
    */

    if (task._id) {

        try {

            const token =
                localStorage.getItem(
                    "paperNestToken"
                );


            const response =
                await fetch(
                    `${API_URL}/${id}`,
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
                    "Could not delete task"
                );

            }


            data.tasks =
                data.tasks.filter(
                    item =>
                        String(
                            item._id
                        ) !== String(id)
                );


        } catch (error) {

            console.error(
                "Error deleting task:",
                error
            );

            alert(
                "Task could not be deleted."
            );

            return;

        }

    } else {

        /*
           Local task
        */

        data.tasks =
            data.tasks.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );

        saveLocalData();

    }


    renderTasks();
renderProgress();

alert(`Task "${task.title}" deleted successfully!`);

}


window.deleteTask =
    deleteTask;


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics() {

    const total =
        data.tasks.length;


    const completed =
        data.tasks.filter(
            task =>
                task.completed
        ).length;


    const pending =
        total - completed;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed /
                    total) *
                100
            );


    const totalTasks =
        getElement(
            "totalTasks"
        );

    const completedTasks =
        getElement(
            "completedTasks"
        );

    const pendingTasks =
        getElement(
            "pendingTasks"
        );

    const productivity =
        getElement(
            "productivity"
        );

    const circlePercentage =
        getElement(
            "circlePercentage"
        );


    if (totalTasks) {

        totalTasks.textContent =
            total;

    }


    if (completedTasks) {

        completedTasks.textContent =
            completed;

    }


    if (pendingTasks) {

        pendingTasks.textContent =
            pending;

    }


    if (productivity) {

        productivity.textContent =
            percentage + "%";

    }


    if (circlePercentage) {

        circlePercentage.textContent =
            percentage + "%";

    }


    updateCircle(
        percentage
    );

}


/* =========================================================
   PROGRESS CIRCLE
   ========================================================= */

function updateCircle(
    percentage
) {

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
            #e6ddcf 0deg
        )`;

}


/* =========================================================
   ADD TASK
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


            const nameInput =
                getElement(
                    "taskName",
                    "taskTitle"
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


            if (!nameInput) {
                return;
            }


            const name =
                nameInput.value.trim();


            if (!name) {

                alert(
                    "Please enter a task."
                );

                nameInput.focus();

                return;

            }


            const today =
                new Date();


            const date =
                today
                    .toISOString()
                    .split("T")[0];


            const newTask = {

                title: name,

                time:
                    timeInput
                        ? timeInput.value
                        : "",

                subject:
                    subjectInput
                        ? subjectInput.value
                        : "General",

                priority:
                    priorityInput
                        ? priorityInput.value
                        : "Normal",

                completed: false,

                date: date

            };


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
                                    newTask
                                )
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Failed to add task"
                    );

                }


                data.tasks.unshift(
    result
);

alert(
    `Task "${name}" added successfully!`
);

taskForm.reset();

renderTasks();

renderProgress();

openPage(
    "planner"
);


            } catch (error) {

                console.error(
                    "Error adding task:",
                    error
                );


                alert(
                    "Task could not be added. Check the server terminal."
                );

            }

        }
    );

}


/* =========================================================
   HOME ADD TASK
   ========================================================= */

const homeAddTask =
    getElement(
        "homeAddTask"
    );


if (homeAddTask) {

    homeAddTask.addEventListener(
        "click",
        function () {

            openPage(
                "planner"
            );


            setTimeout(
                function () {

                    const input =
                        getElement(
                            "taskName",
                            "taskTitle"
                        );


                    if (input) {
                        input.focus();
                    }

                },
                100
            );

        }
    );

}


/* =========================================================
   NEW TASK BUTTON
   ========================================================= */

const newTaskButton =
    getElement(
        "newTaskButton"
    );


if (newTaskButton) {

    newTaskButton.addEventListener(
        "click",
        function () {

            openPage(
                "planner"
            );


            setTimeout(
                function () {

                    const input =
                        getElement(
                            "taskName",
                            "taskTitle"
                        );


                    if (input) {
                        input.focus();
                    }

                },
                100
            );

        }
    );

}


/* =========================================================
   NOTES
   ========================================================= */

function renderNotes() {

    const notesGrid =
        getElement(
            "notesGrid"
        );


    if (!notesGrid) {
        return;
    }


    if (
        data.notes.length === 0
    ) {

        notesGrid.innerHTML =
            emptyMessage(
                "No notes yet. Start writing."
            );

        return;

    }


    notesGrid.innerHTML =
        data.notes
            .map(
                (note, index) => `

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
                            >
                                🗑️
                            </button>

                        </div>


                        <h3>

                            ${escapeHTML(
                                note.title
                            )}

                        </h3>


                        <p style="
                            white-space:pre-line;
                        ">

                            ${escapeHTML(
                                note.content
                            )}

                        </p>

                    </article>

                `
            )
            .join("");

}


/* =========================================================
   DELETE NOTE
   ========================================================= */

function deleteNote(id) {

    const note =
        data.notes.find(
            note =>
                String(note.id) ===
                String(id)
        );


    if (!note) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${note.title}"?`
        );


    if (!confirmed) {
        return;
    }


    data.notes =
        data.notes.filter(
            note =>
                String(note.id) !==
                String(id)
        );


    saveLocalData();

    renderNotes();

}


window.deleteNote =
    deleteNote;


/* =========================================================
   NOTE MODAL
   ========================================================= */

const noteModal =
    getElement(
        "noteModal"
    );

const newNoteButton =
    getElement(
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


function closeNoteModal() {

    if (noteModal) {

        noteModal.classList.remove(
            "show"
        );

    }

}


if (closeNoteButton) {

    closeNoteButton.addEventListener(
        "click",
        closeNoteModal
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

                closeNoteModal();

            }

        }
    );

}


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

const SUBJECT_API_URL = "/api/subjects";


/* ---------------------------------------------------------
   GET LOGGED-IN USER ID
   --------------------------------------------------------- */

function getUserId() {

    const savedUser = localStorage.getItem("paperNestUser");

    if (!savedUser) {
        return null;
    }

    try {

        const user = JSON.parse(savedUser);

        return user._id || user.id || user.userId || null;

    } catch (error) {

        console.error("Error reading user:", error);

        return null;
    }
}

function populateSubjectDropdown() {

    const dropdown =
        document.getElementById("taskSubject");

    if (!dropdown) {
        return;
    }

    dropdown.innerHTML = "";

    const generalOption =
        document.createElement("option");

    generalOption.value = "General";
    generalOption.textContent = "General";

    dropdown.appendChild(generalOption);


    data.subjects.forEach(subject => {

        const option =
            document.createElement("option");

        option.value = subject.name;
        option.textContent = subject.name;

        dropdown.appendChild(option);

    });

}
/* ---------------------------------------------------------
   LOAD SUBJECTS FROM MONGODB
   --------------------------------------------------------- */
function populateSubjectDropdown() {

    const dropdown =
        document.getElementById("taskSubject");

    if (!dropdown) return;

    dropdown.innerHTML = "";

    const generalOption =
        document.createElement("option");

    generalOption.value = "General";
    generalOption.textContent = "General";

    dropdown.appendChild(generalOption);

    data.subjects.forEach(subject => {

        const option =
            document.createElement("option");

        option.value = subject.name;
        option.textContent = subject.name;

        dropdown.appendChild(option);

    });
}
async function loadSubjects() {

    try {

        const userId = getUserId();

        if (!userId) {

            console.warn("No user ID found.");

            data.subjects = [];
            populateSubjectDropdown();

            renderSubjects();
            renderProgress();

            return;
        }


        console.log("Loading subjects from MongoDB...");


        const response = await fetch(
            SUBJECT_API_URL,
            {
                method: "GET",

                headers: {
                    "user-id": userId
                }
            }
        );


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load subjects"
            );

        }


        data.subjects =
            Array.isArray(result.subjects)
                ? result.subjects
                : [];


        console.log(
            "Subjects loaded:",
            data.subjects
        );


        renderSubjects();
        renderProgress();


    } catch (error) {

        console.error(
            "Error loading subjects:",
            error
        );

        renderSubjects();
        renderProgress();
    }

}


/* ---------------------------------------------------------
   RENDER SUBJECTS
   --------------------------------------------------------- */
function renderSubjects() {

    const container =
        getElement("subjectsContainer");

    /*
     * Update Planner Subject dropdown
     */
    const dropdown =
        document.getElementById("taskSubject");

    if (dropdown) {

        dropdown.innerHTML = "";

        const generalOption =
            document.createElement("option");

        generalOption.value = "General";
        generalOption.textContent = "General";

        dropdown.appendChild(generalOption);


        if (Array.isArray(data.subjects)) {

            data.subjects.forEach(subject => {

                const option =
                    document.createElement("option");

                option.value = subject.name;
                option.textContent = subject.name;

                dropdown.appendChild(option);

            });

        }
    }


    /*
     * Display subjects
     */
    if (!container) {
        return;
    }


    if (
        !Array.isArray(data.subjects) ||
        data.subjects.length === 0
    ) {

        container.innerHTML =
            emptyMessage("No subjects added yet.");

        return;
    }


    container.innerHTML =
        data.subjects
            .map(subject => {

                const progress =
                    Number(subject.progress) || 0;

                return `
                    <div class="paper-card subject-card">

                        <div class="subject-header">

                            <h3>
                                ${escapeHTML(subject.name)}
                            </h3>

                            <span class="subject-percent">
                                ${progress}%
                            </span>

                        </div>

                        <div class="progress-bar">

                            <span
                                style="width: ${progress}%"
                            ></span>

                        </div>

                        <small>
                            Keep nurturing this subject 🌱
                        </small>

                    </div>
                `;

            })
            .join("");
}

/* ---------------------------------------------------------
   ADD SUBJECT
   --------------------------------------------------------- */

async function addSubject(name, progress = 0) {

    try {

        const userId = getUserId();

        if (!userId) {

            alert(
                "Please log in again."
            );

            return false;
        }


        const response =
            await fetch(
                SUBJECT_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "user-id":
                            userId
                    },

                    body:
                        JSON.stringify({
                            name: name.trim(),
                            progress: Number(progress) || 0
                        })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to add subject"
            );

        }


        console.log(
            "Subject added:",
            result.subject
        );


        data.subjects.push(
            result.subject
        );


        renderSubjects();
        renderProgress();


        return true;


    } catch (error) {

        console.error(
            "Error adding subject:",
            error
        );


        alert(
            error.message ||
            "Subject could not be added."
        );


        return false;
    }

}


/* ---------------------------------------------------------
   DELETE SUBJECT
   --------------------------------------------------------- */

async function deleteSubject(id) {

    const subject =
        data.subjects.find(
            item =>
                String(
                    item._id ||
                    item.id
                ) === String(id)
        );


    if (!subject) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${subject.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const userId = getUserId();

        if (!userId) {

            alert(
                "Please log in again."
            );

            return;
        }


        const response =
            await fetch(
                `${SUBJECT_API_URL}/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "user-id":
                            userId
                    }
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to delete subject"
            );

        }


        data.subjects =
            data.subjects.filter(
                item =>
                    String(
                        item._id ||
                        item.id
                    ) !== String(id)
            );


        renderSubjects();
        renderProgress();


        console.log(
            "Subject deleted successfully."
        );


    } catch (error) {

        console.error(
            "Error deleting subject:",
            error
        );


        alert(
            "Subject could not be deleted."
        );
    }

}


window.addSubject =
    addSubject;

window.deleteSubject =
    deleteSubject;

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


            /*
               Remove login information.
            */

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
/* =========================================================
   ADD SUBJECT MODAL
   ========================================================= */

const addSubjectBtn = document.getElementById("addSubjectBtn");
const subjectModal = document.getElementById("subjectModal");
const closeSubjectModal = document.getElementById("closeSubjectModal");
const cancelSubjectBtn = document.getElementById("cancelSubjectBtn");
const saveSubjectBtn = document.getElementById("saveSubjectBtn");

const subjectName = document.getElementById("subjectName");
const subjectProgress = document.getElementById("subjectProgress");
const subjectMessage = document.getElementById("subjectMessage");


/* OPEN ADD SUBJECT MODAL */

if (addSubjectBtn) {
    addSubjectBtn.addEventListener("click", function () {

        subjectModal.classList.add("show");

        subjectName.value = "";
        subjectProgress.value = 0;
        subjectMessage.textContent = "";

        subjectName.focus();
    });
}


/* CLOSE MODAL */

function closeSubjectPopup() {

    if (subjectModal) {
        subjectModal.classList.remove("show");
    }

}


if (closeSubjectModal) {
    closeSubjectModal.addEventListener(
        "click",
        closeSubjectPopup
    );
}


if (cancelSubjectBtn) {
    cancelSubjectBtn.addEventListener(
        "click",
        closeSubjectPopup
    );
}


/* SAVE SUBJECT */

if (saveSubjectBtn) {

    saveSubjectBtn.addEventListener("click", async function () {

        const name = subjectName.value.trim();
        const progress = Number(subjectProgress.value) || 0;

        if (!name) {

            subjectMessage.textContent =
                "Please enter a subject name.";

            return;
        }

        if (progress < 0 || progress > 100) {

            subjectMessage.textContent =
                "Progress must be between 0 and 100.";

            return;
        }


        const savedUser =
            localStorage.getItem("paperNestUser");


        if (!savedUser) {

            subjectMessage.textContent =
                "Please log in again.";

            return;
        }


        let user;

        try {

            user = JSON.parse(savedUser);

        } catch (error) {

            subjectMessage.textContent =
                "User information is invalid.";

            return;
        }


        const userId =
            user._id ||
            user.id ||
            user.userId;


        if (!userId) {

            subjectMessage.textContent =
                "User ID not found. Please log in again.";

            return;
        }


        saveSubjectBtn.disabled = true;
        saveSubjectBtn.textContent = "Saving...";


        try {

            const response = await fetch(
                "/api/subjects",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "user-id": userId
                    },

                    body: JSON.stringify({
                        name: name,
                        progress: progress
                    })
                }
            );


            const result = await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Failed to add subject"
                );

            }


            /* ADD NEW SUBJECT TO THE DASHBOARD */

            if (!Array.isArray(data.subjects)) {
                data.subjects = [];
            }

            data.subjects.push(result.subject);


            /* DISPLAY IT IMMEDIATELY */

            renderSubjects();
            renderProgress();


            /* CLOSE MODAL */

            closeSubjectPopup();


            console.log(
                "Subject added successfully:",
                result.subject
            );


        } catch (error) {

            console.error(
                "Add subject error:",
                error
            );

            subjectMessage.textContent =
                error.message ||
                "Failed to add subject.";

        }


        saveSubjectBtn.disabled = false;
        saveSubjectBtn.textContent = "Save Subject";

    });

}


/* CLOSE MODAL WHEN CLICKING OUTSIDE */

if (subjectModal) {

    subjectModal.addEventListener("click", function (event) {

        if (event.target === subjectModal) {
            closeSubjectPopup();
        }

    });

}
function populateSubjectDropdown() {

    const dropdown = document.getElementById("taskSubject");

    if (!dropdown) {
        return;
    }

    dropdown.innerHTML = "";

    const general = document.createElement("option");
    general.value = "General";
    general.textContent = "General";
    dropdown.appendChild(general);

    if (Array.isArray(data.subjects)) {

        data.subjects.forEach(subject => {

            const option = document.createElement("option");

            option.value = subject.name;
            option.textContent = subject.name;

            dropdown.appendChild(option);

        });

    }
}

if (checkLogin()) {

    loadAccount();

    renderTasks();

    renderNotes();

    renderSubjects();

    renderProgress();

    renderCalendar();

    updateStatistics();

    loadTasks();

    loadSubjects();


    

}
/*
   Check login first.
*/
