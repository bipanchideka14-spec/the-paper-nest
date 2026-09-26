/* =========================================================
   THE PAPER NEST - DASHBOARD JAVASCRIPT
   ========================================================= */

const API_URL = "/api/tasks";
const AUTH_API_URL = "/api/auth";
const SUBJECT_API_URL = "/api/subjects";
const PROFILE_API_URL = "/api/profile";
const EVENTS_API_URL = "/api/events";

let calendarEvents = [];
let selectedCalendarDate = "";
let profileImageData = "";


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
   DATA
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

        data.notes =
            defaultData.notes;


        data.subjects =
            defaultData.subjects;

    }

} catch (error) {

    console.error(
        "Error loading local data:",
        error
    );


    data.notes =
        defaultData.notes;


    data.subjects =
        defaultData.subjects;

}


/* =========================================================
   SAVE LOCAL DATA
   ========================================================= */

function saveLocalData() {

    try {

        localStorage.setItem(

            "paperNestData",

            JSON.stringify({

                notes:
                    data.notes,

                subjects:
                    data.subjects

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

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   LOGIN CHECK
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

        window.location.href =
            "/login";

        return false;

    }


    return true;

}


/* =========================================================
   GET USER ID
   ========================================================= */

function getUserId() {

    const savedUser =
        localStorage.getItem(
            "paperNestUser"
        );


    if (!savedUser) {

        return null;

    }


    try {

        const user =
            JSON.parse(savedUser);


        return (
            user._id ||
            user.id ||
            user.userId ||
            null
        );

    } catch (error) {

        console.error(
            "Error reading user:",
            error
        );


        return null;

    }

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


    try {

        const user =
            JSON.parse(savedUser);


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


        const profilePanelAvatar =
            getElement(
                "profilePanelAvatar"
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


        const initial =
            (user.name || "U")
                .charAt(0)
                .toUpperCase();


        if (profileAvatar) {

            profileAvatar.textContent =
                initial;

        }


        if (profilePanelAvatar) {

            profilePanelAvatar.textContent =
                initial;

        }

    } catch (error) {

        console.error(
            "Account data error:",
            error
        );

    }

}


/* =========================================================
   PAPER NEST POPUP STYLES
   ========================================================= */

function injectPopupStyles() {

    if (
        document.getElementById(
            "paperNestPopupStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "paperNestPopupStyles";


    style.textContent = `

        .paper-nest-popup-overlay {

            position: fixed;

            inset: 0;

            background:
                rgba(67, 45, 32, 0.35);

            backdrop-filter:
                blur(5px);

            display: flex;

            align-items: center;

            justify-content: center;

            z-index: 100000;

            padding: 20px;

            box-sizing: border-box;

        }


        .paper-nest-popup {

            width: min(390px, 100%);

            box-sizing: border-box;

            background: #fffaf2;

            border: 1px solid #eadbc9;

            border-radius: 24px;

            padding: 30px;

            text-align: center;

            box-shadow:
                0 20px 60px
                rgba(75, 49, 34, 0.22);

        }


        .paper-nest-popup-icon {

            width: 54px;

            height: 54px;

            margin:
                0 auto 16px;

            border-radius: 50%;

            background: #f2dfd2;

            display: flex;

            align-items: center;

            justify-content: center;

            color: #6b4029;

            font-size: 23px;

        }


        .paper-nest-popup h2 {

            margin:
                0 0 10px;

            color:
                #5d3927;

            font-family:
                Georgia, serif;

            font-size:
                26px;

            font-weight:
                500;

        }


        .paper-nest-popup p {

            margin:
                0 auto 24px;

            color:
                #927a65;

            font-size:
                14px;

            line-height:
                1.6;

        }


        .paper-nest-popup-buttons {

            display:
                flex;

            gap:
                12px;

        }


        .paper-nest-popup-buttons button {

            flex:
                1;

            min-height:
                45px;

            border-radius:
                12px;

            padding:
                10px 15px;

            border:
                1px solid #d9c9b7;

            font:
                inherit;

            font-weight:
                600;

            cursor:
                pointer;

        }


        .paper-nest-popup-cancel {

            background:
                #f5eee4;

            color:
                #705541;

        }


        .paper-nest-popup-confirm {

            background:
                #6b4029;

            color:
                white;

            border-color:
                #6b4029 !important;

        }


        .paper-nest-popup-ok {

            background:
                #6b4029;

            color:
                white;

            border-color:
                #6b4029 !important;

        }


        @media (max-width: 500px) {

            .paper-nest-popup-buttons {

                flex-direction:
                    column;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   CLOSE POPUP
   ========================================================= */

function closePaperNestPopup() {

    const popup =
        document.getElementById(
            "paperNestPopup"
        );


    if (popup) {

        popup.remove();

    }

}


/* =========================================================
   CONFIRMATION POPUP
   ========================================================= */

function showPaperNestConfirm(
    title,
    message,
    onConfirm,
    icon = "?"
) {

    injectPopupStyles();

    closePaperNestPopup();


    const popup =
        document.createElement(
            "div"
        );


    popup.id =
        "paperNestPopup";


    popup.className =
        "paper-nest-popup-overlay";


    const actionText =
        icon === "↪"
            ? "Log out"
            : "Delete";


    popup.innerHTML = `

        <div
            class="paper-nest-popup"
            role="dialog"
            aria-modal="true"
        >

            <div class="paper-nest-popup-icon">
                ${icon}
            </div>


            <h2>
                ${escapeHTML(title)}
            </h2>


            <p>
                ${escapeHTML(message)}
            </p>


            <div
                class="paper-nest-popup-buttons"
            >

                <button
                    type="button"
                    class="paper-nest-popup-cancel"
                    id="paperNestPopupCancel"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    class="paper-nest-popup-confirm"
                    id="paperNestPopupConfirm"
                >
                    ${actionText}
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        popup
    );


    document
        .getElementById(
            "paperNestPopupCancel"
        )
        .addEventListener(
            "click",
            closePaperNestPopup
        );


    document
        .getElementById(
            "paperNestPopupConfirm"
        )
        .addEventListener(
            "click",
            async function () {

                closePaperNestPopup();

                await onConfirm();

            }
        );


    popup.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                popup
            ) {

                closePaperNestPopup();

            }

        }
    );

}


/* =========================================================
   SUCCESS / INFORMATION POPUP
   ========================================================= */

function showPaperNestMessage(
    message,
    title = "Done"
) {

    injectPopupStyles();

    closePaperNestPopup();


    const popup =
        document.createElement(
            "div"
        );


    popup.id =
        "paperNestPopup";


    popup.className =
        "paper-nest-popup-overlay";


    popup.innerHTML = `

        <div
            class="paper-nest-popup"
            role="dialog"
            aria-modal="true"
        >

            <div class="paper-nest-popup-icon">
                ✓
            </div>


            <h2>
                ${escapeHTML(title)}
            </h2>


            <p>
                ${escapeHTML(message)}
            </p>


            <div
                class="paper-nest-popup-buttons"
            >

                <button
                    type="button"
                    class="paper-nest-popup-ok"
                    id="paperNestPopupOK"
                >
                    OK
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        popup
    );


    document
        .getElementById(
            "paperNestPopupOK"
        )
        .addEventListener(
            "click",
            closePaperNestPopup
        );


    popup.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                popup
            ) {

                closePaperNestPopup();

            }

        }
    );

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

    pages.forEach(
        page => {

            page.classList.remove(
                "active-page"
            );

        }
    );


    const selectedPage =
        document.getElementById(
            pageName
        );


    if (selectedPage) {

        selectedPage.classList.add(
            "active-page"
        );

    }


    navItems.forEach(
        item => {

            item.classList.toggle(
                "active",
                item.dataset.page ===
                pageName
            );

        }
    );


    if (
        pageName === "planner"
    ) {

        renderTasks();

    }


    if (
        pageName === "notes"
    ) {

        renderNotes();

    }


    if (
        pageName === "subjects"
    ) {

        renderSubjects();

    }


    if (
        pageName === "progress"
    ) {

        renderProgress();

    }


    if (
        pageName === "home"
    ) {

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


navItems.forEach(
    item => {

        item.addEventListener(
            "click",
            function () {

                openPage(
                    item.dataset.page
                );

            }
        );

    }
);


document
    .querySelectorAll(
        "[data-page-link]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    openPage(
                        button.dataset.pageLink
                    );

                }
            );

        }
    );


/* =========================================================
   CURRENT DATE
   ========================================================= */

function updateGreeting() {
    const greeting = getElement("greetingText");
    if (!greeting) return;

    const hour = new Date().getHours();
    let message;

    if (hour >= 5 && hour < 12) {
        message = "Good morning!";
    } else if (hour >= 12 && hour < 17) {
        message = "Good afternoon!";
    } else if (hour >= 17 && hour < 21) {
        message = "Good evening!";
    } else {
        message = "Good night!";
    }

    greeting.textContent = message;
}

function displayDate() {

    const currentDate = getElement("currentDate");
    const today = new Date();

    if (currentDate) {
        currentDate.textContent = today.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        ).toUpperCase();
    }

    updateGreeting();
}

displayDate();
setInterval(updateGreeting, 60000);


/* =========================================================
   TASK API - LOAD
   ========================================================= */

async function loadTasks() {

    try {

        const userId =
            getUserId();


        const token =
            localStorage.getItem(
                "paperNestToken"
            );


        if (!userId) {

            data.tasks = [];

            renderTasks();

            renderProgress();

            return;

        }


        const response =
            await fetch(
                API_URL,
                {
                    method:
                        "GET",

                    headers: {

                        "user-id":
                            userId,

                        ...(token
                            ? {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                            : {})

                    }

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load tasks"
            );

        }


        data.tasks =
            Array.isArray(result)
                ? result
                : [];


        renderTasks();

        renderProgress();

    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );


        data.tasks = [];

        renderTasks();

        renderProgress();

    }

}


/* =========================================================
   CREATE TASK HTML
   ========================================================= */

function createTaskHTML(task) {

    const taskId =
        task._id ||
        task.id;


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
                    onclick="toggleTask('${escapeHTML(taskId)}')"
                    title="Mark task complete"
                >
                    ${
                        task.completed
                            ? "✓"
                            : ""
                    }
                </button>


                <div class="task-details">

                    <h3
                        class="${
                            task.completed
                                ? "completed-task"
                                : ""
                        }"
                    >
                        ${escapeHTML(
                            task.title
                        )}
                    </h3>


                    <p>

                        ${
                            escapeHTML(
                                task.time ||
                                "Anytime"
                            )
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
                    onclick="deleteTask('${escapeHTML(taskId)}')"
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

        <p
            style="
                color:#927a65;
                font-size:12px;
                padding:20px 0;
            "
        >
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
            item =>
                String(
                    item._id ||
                    item.id
                ) ===
                String(id)
        );


    if (!task) {

        return;

    }


    if (task._id) {

        try {

            const userId =
                getUserId();


            const token =
                localStorage.getItem(
                    "paperNestToken"
                );


            const response =
                await fetch(
                    `${API_URL}/${id}`,
                    {
                        method:
                            "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "user-id":
                                userId || "",

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


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Could not update task"
                );

            }


            const index =
                data.tasks.findIndex(
                    item =>
                        String(
                            item._id
                        ) ===
                        String(id)
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


            showPaperNestMessage(
                error.message ||
                "Task could not be updated.",
                "Update failed"
            );


            return;

        }

    } else {

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
            item =>
                String(
                    item._id ||
                    item.id
                ) ===
                String(id)
        );


    if (!task) {

        return;

    }


    showPaperNestConfirm(

        `Delete "${task.title}"?`,

        "This task will be removed from your planner.",

        async function () {

            if (task._id) {

                try {

                    const userId =
                        getUserId();


                    const token =
                        localStorage.getItem(
                            "paperNestToken"
                        );


                    const response =
                        await fetch(
                            `${API_URL}/${id}`,
                            {
                                method:
                                    "DELETE",

                                headers: {

                                    "user-id":
                                        userId || "",

                                    ...(token
                                        ? {
                                            "Authorization":
                                                `Bearer ${token}`
                                        }
                                        : {})

                                }

                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            result.message ||
                            "Could not delete task"
                        );

                    }


                    data.tasks =
                        data.tasks.filter(
                            item =>
                                String(
                                    item._id
                                ) !==
                                String(id)
                        );


                } catch (error) {

                    console.error(
                        "Error deleting task:",
                        error
                    );


                    showPaperNestMessage(
                        error.message ||
                        "Task could not be deleted.",
                        "Delete failed"
                    );


                    return;

                }

            } else {

                data.tasks =
                    data.tasks.filter(
                        item =>
                            String(
                                item.id
                            ) !==
                            String(id)
                    );


                saveLocalData();

            }


            renderTasks();

            renderProgress();


            showPaperNestMessage(
                `Task "${task.title}" deleted successfully!`
            );

        },

        "🗑"

    );

}


window.deleteTask =
    deleteTask;


/* =========================================================
   UPDATE STATISTICS
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
        total -
        completed;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) *
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
            percentage +
            "%";

    }


    if (circlePercentage) {

        circlePercentage.textContent =
            percentage +
            "%";

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

                showPaperNestMessage(
                    "Please enter a task.",
                    "Task needed"
                );


                nameInput.focus();

                return;

            }


            const userId =
                getUserId();


            const token =
                localStorage.getItem(
                    "paperNestToken"
                );


            if (!userId) {

                showPaperNestMessage(
                    "Please log in again.",
                    "Login required"
                );

                return;

            }


            const today =
                new Date();


            const date =
                today
                    .toISOString()
                    .split("T")[0];


            const newTask = {

                title:
                    name,

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

                completed:
                    false,

                date:
                    date

            };


            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "user-id":
                                    userId,

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


                taskForm.reset();


                renderTasks();

                renderProgress();


                openPage(
                    "planner"
                );


                /*
                   IMPORTANT:
                   There is NO success popup here.
                   Task is added silently.
                */

            } catch (error) {

                console.error(
                    "Error adding task:",
                    error
                );


                showPaperNestMessage(
                    error.message ||
                    "Task could not be added. Check the server.",
                    "Could not add task"
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

                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                align-items:center;
                                gap:10px;
                            "
                        >

                            <p
                                class="small-heading"
                            >

                                NOTE ${
                                    String(
                                        index + 1
                                    ).padStart(
                                        2,
                                        "0"
                                    )
                                }

                            </p>


                            <div
                                style="
                                    display:flex;
                                    gap:6px;
                                    align-items:center;
                                "
                            >

                                <button
                                    type="button"
                                    class="note-edit"
                                    onclick="editNote(${note.id})"
                                    title="Edit note"
                                    aria-label="Edit note"
                                >
                                    ✏️
                                </button>


                                <button
                                    type="button"
                                    class="note-delete"
                                    onclick="deleteNote(${note.id})"
                                    title="Delete note"
                                    aria-label="Delete note"
                                >
                                    🗑️
                                </button>

                            </div>

                        </div>


                        <h3>
                            ${escapeHTML(
                                note.title
                            )}
                        </h3>


                        <p
                            style="
                                white-space:pre-line;
                            "
                        >
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
            item =>
                String(
                    item.id
                ) ===
                String(id)
        );


    if (!note) {

        return;

    }


    showPaperNestConfirm(

        `Delete "${note.title}"?`,

        "This note will be removed from your Paper Nest.",

        async function () {

            data.notes =
                data.notes.filter(
                    item =>
                        String(
                            item.id
                        ) !==
                        String(id)
                );


            saveLocalData();


            renderNotes();


            showPaperNestMessage(
                `Note "${note.title}" deleted successfully!`
            );

        },

        "🗑"

    );

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


let editingNoteId =
    null;


/* =========================================================
   RESET NOTE MODAL
   ========================================================= */

function resetNoteModal() {

    editingNoteId =
        null;


    const titleInput =
        getElement(
            "noteTitle"
        );


    const contentInput =
        getElement(
            "noteContent"
        );


    if (titleInput) {

        titleInput.value =
            "";

    }


    if (contentInput) {

        contentInput.value =
            "";

    }


    if (noteModal) {

        const heading =
            noteModal.querySelector(
                "h3"
            );


        const smallHeading =
            noteModal.querySelector(
                ".small-heading"
            );


        if (heading) {

            heading.textContent =
                "What are you thinking?";

        }


        if (smallHeading) {

            smallHeading.textContent =
                "NEW NOTE";

        }

    }


    if (saveNoteButton) {

        saveNoteButton.textContent =
            "Save Note";

    }

}


/* =========================================================
   OPEN NEW NOTE
   ========================================================= */

if (
    newNoteButton &&
    noteModal
) {

    newNoteButton.addEventListener(
        "click",
        function () {

            resetNoteModal();


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


/* =========================================================
   CLOSE NOTE
   ========================================================= */

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


/* =========================================================
   EDIT NOTE
   ========================================================= */

function editNote(id) {

    const note =
        data.notes.find(
            item =>
                String(
                    item.id
                ) ===
                String(id)
        );


    if (
        !note ||
        !noteModal
    ) {

        return;

    }


    editingNoteId =
        id;


    const titleInput =
        getElement(
            "noteTitle"
        );


    const contentInput =
        getElement(
            "noteContent"
        );


    const heading =
        noteModal.querySelector(
            "h3"
        );


    const smallHeading =
        noteModal.querySelector(
            ".small-heading"
        );


    if (titleInput) {

        titleInput.value =
            note.title || "";

    }


    if (contentInput) {

        contentInput.value =
            note.content || "";

    }


    if (heading) {

        heading.textContent =
            "Edit your thought";

    }


    if (smallHeading) {

        smallHeading.textContent =
            "EDIT NOTE";

    }


    if (saveNoteButton) {

        saveNoteButton.textContent =
            "Update Note";

    }


    noteModal.classList.add(
        "show"
    );


    if (titleInput) {

        titleInput.focus();

    }

}


window.editNote =
    editNote;


/* =========================================================
   SAVE / UPDATE NOTE
   ========================================================= */

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

                showPaperNestMessage(
                    "Please write something first.",
                    "Note needed"
                );

                return;

            }


            /* EDIT EXISTING NOTE */

            if (
                editingNoteId !==
                null
            ) {

                const index =
                    data.notes.findIndex(
                        item =>
                            String(
                                item.id
                            ) ===
                            String(
                                editingNoteId
                            )
                    );


                if (index !== -1) {

                    data.notes[index] = {

                        ...data.notes[index],

                        title:
                            title ||
                            "Untitled Note",

                        content:
                            content

                    };


                    const updatedTitle =
                        data.notes[index].title;


                    saveLocalData();

                    renderNotes();

                    closeNoteModal();

                    resetNoteModal();


                    showPaperNestMessage(
                        `Note "${updatedTitle}" updated successfully!`
                    );

                }


                return;

            }


            /* CREATE NEW NOTE */

            data.notes.unshift({

                id:
                    Date.now(),

                title:
                    title ||
                    "Untitled Note",

                content:
                    content

            });


            saveLocalData();

            renderNotes();

            closeNoteModal();

            resetNoteModal();

        }
    );

}


/* =========================================================
   SUBJECT DROPDOWN
   ========================================================= */

function populateSubjectDropdown() {

    const dropdown =
        document.getElementById(
            "taskSubject"
        );


    if (!dropdown) {

        return;

    }


    dropdown.innerHTML =
        "";


    const general =
        document.createElement(
            "option"
        );


    general.value =
        "General";


    general.textContent =
        "General";


    dropdown.appendChild(
        general
    );


    if (
        Array.isArray(
            data.subjects
        )
    ) {

        data.subjects.forEach(
            subject => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    subject.name;


                option.textContent =
                    subject.name;


                dropdown.appendChild(
                    option
                );

            }
        );

    }

}


/* =========================================================
   LOAD SUBJECTS FROM MONGODB
   ========================================================= */

async function loadSubjects() {

    try {

        const userId =
            getUserId();


        if (!userId) {

            data.subjects = [];

            populateSubjectDropdown();

            renderSubjects();

            renderProgress();

            return;

        }


        console.log(
            "Loading subjects from MongoDB..."
        );


        const response =
            await fetch(
                SUBJECT_API_URL,
                {
                    method:
                        "GET",

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
                "Failed to load subjects"
            );

        }


        data.subjects =
            Array.isArray(
                result.subjects
            )
                ? result.subjects
                : [];


        populateSubjectDropdown();

        renderSubjects();

        renderProgress();


        console.log(
            "Subjects loaded:",
            data.subjects
        );

    } catch (error) {

        console.error(
            "Error loading subjects:",
            error
        );


        populateSubjectDropdown();

        renderSubjects();

        renderProgress();

    }

}


/* =========================================================
   RENDER SUBJECTS
   ========================================================= */

function updateActiveSubjectsCount() {
    const countElement = getElement("activeSubjectsCount");
    if (!countElement) return;
    countElement.textContent = Array.isArray(data.subjects) ? data.subjects.length : 0;
}

function renderSubjects() {

    updateActiveSubjectsCount();

    /*
       Your dashboard.html uses:
       subjectsContainer

       We also support subjectsGrid in case
       you use that ID later.
    */

    const container =
        getElement(
            "subjectsContainer",
            "subjectsGrid"
        );


    if (!container) {

        console.error(
            "Subjects container not found."
        );

        return;

    }


    populateSubjectDropdown();


    if (
        !Array.isArray(
            data.subjects
        ) ||
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
                subject => {

                    const progress =
                        Math.max(
                            0,
                            Math.min(
                                100,
                                Number(
                                    subject.progress
                                ) || 0
                            )
                        );


                    const subjectId =
                        subject._id ||
                        subject.id;


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
                                    ${progress}%
                                </span>

                            </div>


                            <div
                                class="progress-bar"
                            >

                                <span
                                    style="
                                        width:
                                        ${progress}%;
                                    "
                                ></span>

                            </div>


                            <small>
                                Keep nurturing this subject 🌱
                            </small>


                            <div
                                style="
                                    display:flex;
                                    gap:8px;
                                    margin-top:18px;
                                "
                            >

                                <button
                                    type="button"
                                    class="subject-edit-btn"
                                    onclick="editSubject('${escapeHTML(subjectId)}')"
                                    style="
                                        border:1px solid #d9c9b7;
                                        background:#f5eee4;
                                        color:#705541;
                                        padding:9px 12px;
                                        border-radius:10px;
                                        cursor:pointer;
                                    "
                                >
                                    ✏️ Edit
                                </button>


                                <button
                                    type="button"
                                    class="subject-delete-btn"
                                    onclick="deleteSubject('${escapeHTML(subjectId)}')"
                                    style="
                                        border:1px solid #d9c9b7;
                                        background:#f2dfd2;
                                        color:#6b4029;
                                        padding:9px 12px;
                                        border-radius:10px;
                                        cursor:pointer;
                                    "
                                >
                                    🗑️ Delete
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   SUBJECT MODAL
   ========================================================= */

const addSubjectBtn =
    document.getElementById(
        "addSubjectBtn"
    );


const subjectModal =
    document.getElementById(
        "subjectModal"
    );


const closeSubjectModalButton =
    document.getElementById(
        "closeSubjectModal"
    );


const cancelSubjectBtn =
    document.getElementById(
        "cancelSubjectBtn"
    );


const saveSubjectBtn =
    document.getElementById(
        "saveSubjectBtn"
    );


const subjectNameInput =
    document.getElementById(
        "subjectName"
    );


const subjectProgressInput =
    document.getElementById(
        "subjectProgressInput"
    );


const subjectMessage =
    document.getElementById(
        "subjectMessage"
    );


const subjectModalTitle =
    document.getElementById(
        "subjectModalTitle"
    );


let editingSubjectId =
    null;


/* =========================================================
   RESET SUBJECT MODAL
   ========================================================= */

function resetSubjectModal() {

    editingSubjectId =
        null;


    if (subjectModalTitle) {

        subjectModalTitle.textContent =
            "Add Subject";

    }


    if (saveSubjectBtn) {

        saveSubjectBtn.textContent =
            "Save Subject";

    }


    if (subjectNameInput) {

        subjectNameInput.value =
            "";

    }


    if (subjectProgressInput) {

        subjectProgressInput.value =
            0;

    }


    if (subjectMessage) {

        subjectMessage.textContent =
            "";

    }

}


/* =========================================================
   OPEN ADD SUBJECT
   ========================================================= */

function openSubjectModalForAdd() {

    resetSubjectModal();


    if (subjectModal) {

        subjectModal.classList.add(
            "show"
        );

    }


    if (subjectNameInput) {

        subjectNameInput.focus();

    }

}


if (addSubjectBtn) {

    addSubjectBtn.addEventListener(
        "click",
        openSubjectModalForAdd
    );

}


/* =========================================================
   CLOSE SUBJECT MODAL
   ========================================================= */

function closeSubjectPopup() {

    if (subjectModal) {

        subjectModal.classList.remove(
            "show"
        );

    }


    resetSubjectModal();

}


if (closeSubjectModalButton) {

    closeSubjectModalButton.addEventListener(
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


if (subjectModal) {

    subjectModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                subjectModal
            ) {

                closeSubjectPopup();

            }

        }
    );

}


/* =========================================================
   EDIT SUBJECT
   ========================================================= */

function editSubject(id) {

    const subject =
        data.subjects.find(
            item =>
                String(
                    item._id ||
                    item.id
                ) ===
                String(id)
        );


    if (
        !subject ||
        !subjectModal
    ) {

        return;

    }


    editingSubjectId =
        id;


    if (subjectModalTitle) {

        subjectModalTitle.textContent =
            "Edit Subject";

    }


    if (saveSubjectBtn) {

        saveSubjectBtn.textContent =
            "Update Subject";

    }


    if (subjectNameInput) {

        subjectNameInput.value =
            subject.name || "";

    }


    if (subjectProgressInput) {

        subjectProgressInput.value =
            Number(
                subject.progress
            ) || 0;

    }


    if (subjectMessage) {

        subjectMessage.textContent =
            "";

    }


    subjectModal.classList.add(
        "show"
    );


    if (subjectNameInput) {

        subjectNameInput.focus();

    }

}


window.editSubject =
    editSubject;


/* =========================================================
   SAVE / UPDATE SUBJECT
   ========================================================= */

if (saveSubjectBtn) {

    saveSubjectBtn.addEventListener(
        "click",
        async function () {

            const name =
                subjectNameInput
                    ? subjectNameInput.value.trim()
                    : "";


            const progress =
                subjectProgressInput
                    ? Number(
                        subjectProgressInput.value
                    )
                    : 0;


            if (!name) {

                if (subjectMessage) {

                    subjectMessage.textContent =
                        "Please enter a subject name.";

                }

                return;

            }


            if (
                Number.isNaN(progress) ||
                progress < 0 ||
                progress > 100
            ) {

                if (subjectMessage) {

                    subjectMessage.textContent =
                        "Progress must be between 0 and 100.";

                }

                return;

            }


            const userId =
                getUserId();


            if (!userId) {

                if (subjectMessage) {

                    subjectMessage.textContent =
                        "Please log in again.";

                }

                return;

            }


            const isEditing =
                editingSubjectId !==
                null;


            saveSubjectBtn.disabled =
                true;


            saveSubjectBtn.textContent =
                isEditing
                    ? "Updating..."
                    : "Saving...";


            try {

                const url =
                    isEditing
                        ? `${SUBJECT_API_URL}/${editingSubjectId}`
                        : SUBJECT_API_URL;


                const response =
                    await fetch(
                        url,
                        {
                            method:
                                isEditing
                                    ? "PUT"
                                    : "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "user-id":
                                    userId

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    progress:
                                        progress

                                })

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Could not save subject"
                    );

                }


                if (isEditing) {

                    const index =
                        data.subjects.findIndex(
                            item =>
                                String(
                                    item._id ||
                                    item.id
                                ) ===
                                String(
                                    editingSubjectId
                                )
                        );


                    if (index !== -1) {

                        data.subjects[index] =
                            result.subject;

                    }

                } else {

                    data.subjects.push(
                        result.subject
                    );

                }


                populateSubjectDropdown();

                renderSubjects();

                renderProgress();


                closeSubjectPopup();


                if (isEditing) {

                    showPaperNestMessage(
                        `Subject "${result.subject.name}" updated successfully!`
                    );

                }

            } catch (error) {

                console.error(
                    "Subject save error:",
                    error
                );


                if (subjectMessage) {

                    subjectMessage.textContent =
                        error.message ||
                        "Could not save subject.";

                }

            } finally {

                saveSubjectBtn.disabled =
                    false;


                saveSubjectBtn.textContent =
                    isEditing
                        ? "Update Subject"
                        : "Save Subject";

            }

        }
    );

}


/* =========================================================
   ADD SUBJECT FUNCTION
   ========================================================= */

async function addSubject(
    name,
    progress = 0
) {

    const userId =
        getUserId();


    if (!userId) {

        showPaperNestMessage(
            "Please log in again.",
            "Login required"
        );

        return false;

    }


    try {

        const response =
            await fetch(
                SUBJECT_API_URL,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "user-id":
                            userId

                    },

                    body:
                        JSON.stringify({

                            name:
                                name.trim(),

                            progress:
                                Number(
                                    progress
                                ) || 0

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


        data.subjects.push(
            result.subject
        );


        populateSubjectDropdown();

        renderSubjects();

        renderProgress();


        return true;

    } catch (error) {

        console.error(
            "Error adding subject:",
            error
        );


        showPaperNestMessage(
            error.message ||
            "Subject could not be added.",
            "Could not add subject"
        );


        return false;

    }

}


window.addSubject =
    addSubject;


/* =========================================================
   DELETE SUBJECT
   ========================================================= */

async function deleteSubject(id) {

    const subject =
        data.subjects.find(
            item =>
                String(
                    item._id ||
                    item.id
                ) ===
                String(id)
        );


    if (!subject) {

        return;

    }


    showPaperNestConfirm(

        `Delete "${subject.name}"?`,

        "This subject and its progress will be removed.",

        async function () {

            const userId =
                getUserId();


            if (!userId) {

                showPaperNestMessage(
                    "Please log in again.",
                    "Login required"
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${SUBJECT_API_URL}/${id}`,
                        {
                            method:
                                "DELETE",

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
                            ) !==
                            String(id)
                    );


                populateSubjectDropdown();

                renderSubjects();

                renderProgress();


                showPaperNestMessage(
                    `Subject "${subject.name}" deleted successfully!`
                );


            } catch (error) {

                console.error(
                    "Error deleting subject:",
                    error
                );


                showPaperNestMessage(
                    error.message ||
                    "Subject could not be deleted.",
                    "Delete failed"
                );

            }

        },

        "🗑"

    );

}


window.deleteSubject =
    deleteSubject;


/* =========================================================
   PROGRESS PAGE
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
                (
                    completed /
                    total
                ) *
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


    if (
        data.subjects.length ===
        0
    ) {

        subjectProgress.innerHTML =
            emptyMessage(
                "No subjects added yet."
            );

        return;

    }


    subjectProgress.innerHTML =
        data.subjects
            .map(
                subject => {

                    const progress =
                        Number(
                            subject.progress
                        ) || 0;


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
                                        ${progress}%;
                                    "
                                ></span>

                            </div>


                            <span>
                                ${progress}%
                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   CALENDAR
   ========================================================= */

let calendarDate = new Date();

function pad2(value) {
    return String(value).padStart(2, "0");
}

function toDateKey(year, month, day) {
    return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getToken() {
    return localStorage.getItem("paperNestToken");
}

async function apiRequest(url, options = {}) {
    const token = getToken();
    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (options.body && typeof options.body !== "string") {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, { ...options, headers });
    let data = {};
    try {
        data = await response.json();
    } catch (_) {}

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

function setProfileAvatar(element, user) {
    if (!element) return;

    if (user && user.profilePic) {
        element.textContent = "";
        element.style.backgroundImage = `url("${user.profilePic}")`;
        element.style.backgroundSize = "cover";
        element.style.backgroundPosition = "center";
        element.style.backgroundRepeat = "no-repeat";
    } else {
        element.style.backgroundImage = "";
        element.textContent = (user?.name || "U").charAt(0).toUpperCase();
    }
}

function applyUserToUI(user) {
    if (!user) return;

    const profileName = getElement("profileName");
    const accountName = getElement("accountName");
    const accountEmail = getElement("accountEmail");
    const profileAvatar = getElement("profileAvatar");
    const profilePanelAvatar = getElement("profilePanelAvatar");
    const settingsAvatar = getElement("settingsProfileAvatar");

    if (profileName) profileName.textContent = user.name || "My Profile";
    if (accountName) accountName.textContent = user.name || "My Profile";
    if (accountEmail) accountEmail.textContent = user.username ? `@${user.username}` : (user.email || "");

    [profileAvatar, profilePanelAvatar, settingsAvatar].forEach(el => setProfileAvatar(el, user));

    const nameInput = getElement("profileNameInput");
    const usernameInput = getElement("profileUsernameInput");
    const bioInput = getElement("profileBioInput");
    const phoneInput = getElement("profilePhoneInput");
    const locationInput = getElement("profileLocationInput");

    if (nameInput) nameInput.value = user.name || "";
    if (usernameInput) usernameInput.value = user.username || "";
    if (bioInput) bioInput.value = user.bio || "";
    if (phoneInput) phoneInput.value = user.phone || "";
    if (locationInput) locationInput.value = user.location || "";

    profileImageData = user.profilePic || "";
}

async function loadProfile() {
    try {
        const data = await apiRequest(PROFILE_API_URL);
        if (!data.user) return;

        localStorage.setItem("paperNestUser", JSON.stringify(data.user));
        applyUserToUI(data.user);
    } catch (error) {
        console.error("Profile loading error:", error);
        loadAccount();
    }
}

function showInlineMessage(elementId, message, success = true) {
    const element = getElement(elementId);
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("error", !success);
    clearTimeout(element._messageTimer);
    element._messageTimer = setTimeout(() => {
        element.textContent = "";
    }, 3500);
}

function resizeProfileImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const size = 320;
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");

                const scale = Math.max(size / img.width, size / img.height);
                const width = img.width * scale;
                const height = img.height * scale;
                const x = (size - width) / 2;
                const y = (size - height) / 2;

                ctx.drawImage(img, x, y, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.82));
            };
            img.onerror = () => reject(new Error("Could not read the image"));
            img.src = reader.result;
        };
        reader.onerror = () => reject(new Error("Could not read the image"));
        reader.readAsDataURL(file);
    });
}

const profileImageInput = getElement("profileImageInput");
if (profileImageInput) {
    profileImageInput.addEventListener("change", async function () {
        const file = this.files && this.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showInlineMessage("profileSaveMessage", "Please choose an image file.", false);
            return;
        }

        try {
            profileImageData = await resizeProfileImage(file);
            const user = {
                ...(JSON.parse(localStorage.getItem("paperNestUser") || "{}")),
                profilePic: profileImageData
            };
            applyUserToUI(user);
        } catch (error) {
            showInlineMessage("profileSaveMessage", error.message, false);
        }
    });
}

const saveProfileBtn = getElement("saveProfileBtn");
if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", async function () {
        const name = getElement("profileNameInput")?.value.trim();
        const username = getElement("profileUsernameInput")?.value.trim();
        const bio = getElement("profileBioInput")?.value.trim();
        const phone = getElement("profilePhoneInput")?.value.trim();
        const location = getElement("profileLocationInput")?.value.trim();

        if (!name) {
            showInlineMessage("profileSaveMessage", "Name is required.", false);
            return;
        }

        saveProfileBtn.disabled = true;
        try {
            const data = await apiRequest(PROFILE_API_URL, {
                method: "PUT",
                body: { name, username, bio, phone, location, profilePic: profileImageData }
            });

            localStorage.setItem("paperNestUser", JSON.stringify(data.user));
            applyUserToUI(data.user);
            showInlineMessage("profileSaveMessage", "Profile saved ✓");
        } catch (error) {
            showInlineMessage("profileSaveMessage", error.message, false);
        } finally {
            saveProfileBtn.disabled = false;
        }
    });
}

const changePasswordBtn = getElement("changePasswordBtn");
if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", async function () {
        const currentPassword = getElement("currentPasswordInput")?.value;
        const newPassword = getElement("newPasswordInput")?.value;

        if (!currentPassword || !newPassword) {
            showInlineMessage("passwordSaveMessage", "Enter both passwords.", false);
            return;
        }

        changePasswordBtn.disabled = true;
        try {
            const data = await apiRequest(`${PROFILE_API_URL}/password`, {
                method: "PUT",
                body: { currentPassword, newPassword }
            });

            getElement("currentPasswordInput").value = "";
            getElement("newPasswordInput").value = "";
            showInlineMessage("passwordSaveMessage", data.message || "Password changed ✓");
        } catch (error) {
            showInlineMessage("passwordSaveMessage", error.message, false);
        } finally {
            changePasswordBtn.disabled = false;
        }
    });
}

function renderCalendar() {
    const calendar = getElement("calendar");
    const monthTitle = getElement("monthTitle");
    if (!calendar) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const numberOfDays = new Date(year, month + 1, 0).getDate();

    if (monthTitle) {
        monthTitle.textContent = new Date(year, month, 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
    }

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let html = weekdays.map(day => `<div class="day">${day}</div>`).join("");

    for (let i = 0; i < firstDay; i++) html += `<div></div>`;

    const today = new Date();
    for (let day = 1; day <= numberOfDays; day++) {
        const dateKey = toDateKey(year, month, day);
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const isSelected = dateKey === selectedCalendarDate;
        const dayEvents = calendarEvents.filter(event => event.date === dateKey);

        html += `
            <button type="button" class="date calendar-date-button ${isToday ? "today" : ""} ${isSelected ? "selected-date" : ""}" data-date="${dateKey}">
                <span>${day}</span>
                ${dayEvents.length ? `<span class="calendar-event-dots">${dayEvents.slice(0, 3).map(() => "<i></i>").join("")}</span>` : ""}
            </button>
        `;
    }

    calendar.innerHTML = html;

    calendar.querySelectorAll("[data-date]").forEach(button => {
        button.addEventListener("click", () => {
            selectedCalendarDate = button.dataset.date;
            renderCalendar();
            renderAgenda(selectedCalendarDate);
        });
    });

    if (selectedCalendarDate) renderAgenda(selectedCalendarDate);
}

function openEventModal(date = selectedCalendarDate || toDateKey(calendarDate.getFullYear(), calendarDate.getMonth(), 1), event = null) {
    const modal = getElement("eventModal");
    if (!modal) return;

    getElement("eventIdInput").value = event?._id || event?.id || "";
    getElement("eventTitleInput").value = event?.title || "";
    getElement("eventDateInput").value = event?.date || date;
    getElement("eventTimeInput").value = event?.time || "";
    getElement("eventTypeInput").value = event?.type || "Personal";
    getElement("eventDescriptionInput").value = event?.description || "";

    getElement("eventModalEyebrow").textContent = event ? "EDIT EVENT" : "NEW EVENT";
    getElement("eventModalTitle").textContent = event ? "Edit your calendar event" : "Add something to your calendar";
    getElement("saveEventBtn").textContent = event ? "Save changes" : "Save event";
    getElement("deleteEventBtn").hidden = !event;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => getElement("eventTitleInput")?.focus(), 50);
}

function closeEventModal() {
    const modal = getElement("eventModal");
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
}

function formatAgendaDate(dateKey) {
    const date = new Date(`${dateKey}T00:00:00`);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function renderAgenda(dateKey) {
    const title = getElement("agendaTitle");
    const list = getElement("agendaList");
    if (!title || !list) return;

    if (!dateKey) {
        title.textContent = "Choose a date";
        list.innerHTML = `<p class="empty-state">Click a calendar date to see its events.</p>`;
        return;
    }

    title.textContent = formatAgendaDate(dateKey);
    const events = calendarEvents.filter(event => event.date === dateKey);

    if (!events.length) {
        list.innerHTML = `<div class="agenda-empty"><p>No events for this day.</p></div>`;
        return;
    }

    list.innerHTML = events.map(event => `
        <button type="button" class="agenda-item" data-event-id="${event._id}">
            <span class="agenda-time">${escapeHtml(event.time || "All day")}</span>
            <span class="agenda-main">
                <strong>${escapeHtml(event.title)}</strong>
                <small>${escapeHtml(event.type)}${event.description ? ` · ${escapeHtml(event.description)}` : ""}</small>
            </span>
            <span>→</span>
        </button>
    `).join("");

    list.querySelectorAll("[data-event-id]").forEach(button => {
        button.addEventListener("click", () => {
            const event = calendarEvents.find(item => String(item._id) === String(button.dataset.eventId));
            if (event) openEventModal(event.date, event);
        });
    });
}

async function loadEvents() {
    try {
        const today = new Date();
        if (!selectedCalendarDate) {
            selectedCalendarDate = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
        }

        const events = await apiRequest(EVENTS_API_URL);
        calendarEvents = Array.isArray(events) ? events : [];
        renderCalendar();
        renderAgenda(selectedCalendarDate);
    } catch (error) {
        console.error("Event loading error:", error);
        calendarEvents = [];
        renderCalendar();
        renderAgenda(selectedCalendarDate);
    }
}

const addCalendarEvent = getElement("addCalendarEvent");
const agendaAddEvent = getElement("agendaAddEvent");
if (addCalendarEvent) addCalendarEvent.addEventListener("click", () => openEventModal());
if (agendaAddEvent) agendaAddEvent.addEventListener("click", () => openEventModal(selectedCalendarDate));

getElement("closeEventModal")?.addEventListener("click", closeEventModal);
getElement("cancelEventBtn")?.addEventListener("click", closeEventModal);
getElement("eventModal")?.addEventListener("click", event => {
    if (event.target.id === "eventModal") closeEventModal();
});

const saveEventBtn = getElement("saveEventBtn");
if (saveEventBtn) {
    saveEventBtn.addEventListener("click", async () => {
        const id = getElement("eventIdInput").value;
        const payload = {
            title: getElement("eventTitleInput").value.trim(),
            date: getElement("eventDateInput").value,
            time: getElement("eventTimeInput").value,
            type: getElement("eventTypeInput").value,
            description: getElement("eventDescriptionInput").value.trim()
        };

        if (!payload.title || !payload.date) {
            alert("Please enter an event title and date.");
            return;
        }

        saveEventBtn.disabled = true;
        try {
            const data = await apiRequest(id ? `${EVENTS_API_URL}/${id}` : EVENTS_API_URL, {
                method: id ? "PUT" : "POST",
                body: payload
            });

            if (id) {
                calendarEvents = calendarEvents.map(event => String(event._id) === String(id) ? data : event);
            } else {
                calendarEvents.push(data);
            }

            selectedCalendarDate = payload.date;
            const chosenDate = new Date(`${payload.date}T00:00:00`);
            calendarDate = new Date(chosenDate.getFullYear(), chosenDate.getMonth(), 1);
            closeEventModal();
            renderCalendar();
            renderAgenda(selectedCalendarDate);
        } catch (error) {
            alert(error.message);
        } finally {
            saveEventBtn.disabled = false;
        }
    });
}

function showConfirmation(title, message, icon = "trash") {
    return new Promise(resolve => {
        const modal = getElement("confirmationModal");
        const titleEl = getElement("confirmationTitle");
        const messageEl = getElement("confirmationMessage");
        const confirmBtn = getElement("confirmationConfirmBtn");
        const cancelBtn = getElement("confirmationCancelBtn");

        if (!modal || !confirmBtn || !cancelBtn) {
            resolve(false);
            return;
        }

        if (titleEl) titleEl.textContent = title || "Are you sure?";
        if (messageEl) messageEl.textContent = message || "Are you sure you want to continue?";

        const iconEl = getElement("confirmationIcon");
        if (iconEl) {
            iconEl.classList.toggle("logo-icon", icon === "logo");
            iconEl.innerHTML = icon === "logo"
                ? '<img src="logo.png" alt="The Paper Nest logo">'
                : "🗑️";
        }

        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");

        let settled = false;
        const finish = value => {
            if (settled) return;
            settled = true;
            modal.style.display = "none";
            modal.setAttribute("aria-hidden", "true");
            confirmBtn.removeEventListener("click", onConfirm);
            cancelBtn.removeEventListener("click", onCancel);
            modal.removeEventListener("click", onBackdrop);
            document.removeEventListener("keydown", onKeyDown);
            resolve(value);
        };

        const onConfirm = () => finish(true);
        const onCancel = () => finish(false);
        const onBackdrop = event => {
            if (event.target === modal) finish(false);
        };
        const onKeyDown = event => {
            if (event.key === "Escape") finish(false);
        };

        confirmBtn.addEventListener("click", onConfirm);
        cancelBtn.addEventListener("click", onCancel);
        modal.addEventListener("click", onBackdrop);
        document.addEventListener("keydown", onKeyDown);

        setTimeout(() => confirmBtn.focus(), 30);
    });
}

const deleteEventBtn = getElement("deleteEventBtn");
if (deleteEventBtn) {
    deleteEventBtn.addEventListener("click", async () => {
        const id = getElement("eventIdInput").value;
        if (!id) return;

        const confirmed = await showConfirmation(
            "Delete calendar event?",
            "This event will be permanently removed from your calendar.",
            "trash"
        );
        if (!confirmed) return;

        deleteEventBtn.disabled = true;
        try {
            await apiRequest(`${EVENTS_API_URL}/${id}`, { method: "DELETE" });
            calendarEvents = calendarEvents.filter(event => String(event._id) !== String(id));
            closeEventModal();
            renderCalendar();
            renderAgenda(selectedCalendarDate);
        } catch (error) {
            alert(error.message);
        } finally {
            deleteEventBtn.disabled = false;
        }
    });
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
                calendarDate.getMonth() -
                1
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
                calendarDate.getMonth() +
                1
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

async function performLogout() {
    const confirmed = await showConfirmation(
        "Log out of The Paper Nest?",
        "Are you sure you want to log out? You can sign back in anytime.",
        "logo"
    );

    if (!confirmed) return;

    try {
        localStorage.removeItem("paperNestToken");
        localStorage.removeItem("paperNestUser");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    } finally {
        window.location.replace("/login");
    }
}

["logoutBtn", "profileLogout"].forEach(function (id) {
    const button = document.getElementById(id);
    if (!button) return;
    button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        performLogout();
    });
});

/* =========================================================
   NOTIFICATION BUTTON
   ========================================================= */

const notificationButton = document.querySelector(".notification-btn");

if (notificationButton) {
    notificationButton.addEventListener("click", function () {
        const pending = data.tasks.filter(task => !task.completed).length;

        if (pending === 0) {
            showPaperNestMessage(
                "You have no pending tasks. Your nest is clear! 🌿",
                "All caught up"
            );
        } else {
            showPaperNestMessage(
                `You have ${pending} pending task${pending === 1 ? "" : "s"} in your planner.`,
                "A little reminder"
            );
        }
    });
}

/* =========================================================
   KEYBOARD SUPPORT FOR POPUPS
   ========================================================= */

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closePaperNestPopup();
    }
});

/* =========================================================
   START APPLICATION
   ========================================================= */

console.log("The Paper Nest dashboard.js loaded successfully.");

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
    loadProfile();
    loadEvents();
}
