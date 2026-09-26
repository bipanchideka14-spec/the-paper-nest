/* =========================================================
   THE PAPER NEST - DASHBOARD JAVASCRIPT
   ========================================================= */

const API_URL = "/api/tasks";
const AUTH_API_URL = "/api/auth";
const SUBJECT_API_URL = "/api/subjects";

function updateGreeting() {
    const greetingElement = document.getElementById("greeting");

    if (!greetingElement) return;

    const hour = new Date().getHours();

    if (hour < 12) {
        greetingElement.textContent = "Good morning!";
    } else if (hour < 17) {
        greetingElement.textContent = "Good afternoon!";
    } else {
        greetingElement.textContent = "Good evening!";
    }
}

document.addEventListener("DOMContentLoaded", updateGreeting);

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
        today.toLocaleDateString(
            "en-US",
            {
                weekday:
                    "long",

                month:
                    "long",

                day:
                    "numeric"
            }
        ).toUpperCase();

}


displayDate();


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

function renderSubjects() {

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
        "subjectProgress"
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
                    month:
                        "long",

                    year:
                        "numeric"
                }
            );

    }


    const weekdays = [

        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"

    ];


    let html =
        "";


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

            day ===
                today.getDate() &&

            month ===
                today.getMonth() &&

            year ===
                today.getFullYear();


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

    /* -----------------------------------------
       OPEN / CLOSE PROFILE POPUP
       ----------------------------------------- */

    profileButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            profilePanel.classList.toggle(
                "show"
            );

        }
    );


    /* -----------------------------------------
       KEEP POPUP OPEN WHEN CLICKING INSIDE
       ----------------------------------------- */

    profilePanel.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );


    /* -----------------------------------------
       CLOSE POPUP WHEN CLICKING OUTSIDE
       ----------------------------------------- */

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
   LOGOUT MODAL
   ========================================================= */

const profileLogout = document.getElementById("profileLogout");
const sidebarLogout = document.getElementById("logoutBtn");

const logoutModal = document.getElementById("logoutModal");
const logoutModalClose = document.getElementById("logoutModalClose");
const logoutCancel = document.getElementById("logoutCancel");
const logoutConfirm = document.getElementById("logoutConfirm");


/* OPEN LOGOUT MODAL */
function openLogoutModal(event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (logoutModal) {
        logoutModal.classList.add("show");
    }

    if (profilePanel) {
        profilePanel.classList.remove("show");
    }
}


/* CLOSE LOGOUT MODAL */
function closeLogoutModal() {

    if (logoutModal) {
        logoutModal.classList.remove("show");
    }

}


/* PROFILE LOGOUT BUTTON */
if (profileLogout) {

    profileLogout.addEventListener(
        "click",
        openLogoutModal
    );

}


/* SIDEBAR LOGOUT BUTTON */
if (sidebarLogout) {

    sidebarLogout.addEventListener(
        "click",
        openLogoutModal
    );

}


/* CANCEL */
if (logoutCancel) {

    logoutCancel.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            closeLogoutModal();

        }
    );

}


/* CLOSE X */
if (logoutModalClose) {

    logoutModalClose.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            closeLogoutModal();

        }
    );

}


/* CLICK OUTSIDE MODAL */
if (logoutModal) {

    logoutModal.addEventListener(
        "click",
        function (event) {

            if (event.target === logoutModal) {
                closeLogoutModal();
            }

        }
    );

}


/* ACTUAL LOGOUT */
if (logoutConfirm) {

    logoutConfirm.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            localStorage.removeItem("paperNestToken");
            localStorage.removeItem("paperNestUser");

            window.location.href = "/login";

        }
    );

}
/* =========================================================
   CANCEL
   ========================================================= */

if (logoutCancel) {

    logoutCancel.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            closeLogoutModal();

        }
    );

}


/* =========================================================
   CLOSE X
   ========================================================= */

if (logoutModalClose) {

    logoutModalClose.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            closeLogoutModal();

        }
    );

}


/* =========================================================
   CLICK OUTSIDE MODAL
   ========================================================= */

if (logoutModal) {

    logoutModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                logoutModal
            ) {

                closeLogoutModal();

            }

        }
    );

}


/* =========================================================
   CONFIRM LOGOUT
   ========================================================= */

if (logoutConfirm) {

    logoutConfirm.addEventListener(
        "click",
        function () {

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
   NOTIFICATION BUTTON
   ========================================================= */

const notificationButton =
    document.querySelector(
        ".notification-btn"
    );


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        function () {

            const pending =
                data.tasks.filter(
                    task =>
                        !task.completed
                ).length;


            if (
                pending === 0
            ) {

                showPaperNestMessage(
                    "You have no pending tasks. Your nest is clear! 🌿",
                    "All caught up"
                );

            } else {

                showPaperNestMessage(

                    `You have ${pending} pending task${
                        pending === 1
                            ? ""
                            : "s"
                    } in your planner.`,

                    "A little reminder"

                );

            }

        }
    );

}


/* =========================================================
   KEYBOARD SUPPORT FOR POPUPS
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            closePaperNestPopup();

        }

    }
);


/* =========================================================
   START APPLICATION
   ========================================================= */

console.log(
    "The Paper Nest dashboard.js loaded successfully."
);


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