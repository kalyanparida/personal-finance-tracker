let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = JSON.parse(localStorage.getItem("budget")) || 0;

let expenseChart;

// DOM Elements
const expenseForm = document.getElementById("expenseForm");
const expenseTableBody = document.getElementById("expenseTableBody");

const budgetInput = document.getElementById("budgetInput");
const setBudgetBtn = document.getElementById("setBudgetBtn");

const budgetAmount = document.getElementById("budgetAmount");
const expenseAmount = document.getElementById("expenseAmount");
const remainingAmount = document.getElementById("remainingAmount");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");

// ======================
// SET BUDGET
// ======================

setBudgetBtn.addEventListener("click", () => {

    const enteredBudget =
    Number(budgetInput.value);

    if (enteredBudget <= 0) {

        alert("Budget must be greater than 0");

        return;
    }

    budget = enteredBudget;

    localStorage.setItem("budget", JSON.stringify(budget));

    updateSummary();

    budgetInput.value = "";
});

searchInput.addEventListener("input", filterExpenses);

filterCategory.addEventListener("change", filterExpenses);

// ======================
// ADD EXPENSE
// ======================

expenseForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (
        title.trim() === "" ||
        amount <= 0 ||
        category === "" ||
        date === ""
    ) {

        alert("Please enter valid expense details!");

    return;
    }

    const expense = {
        id: Date.now(),
        title,
        amount: Number(amount),
        category,
        date
    };

    expenses.push(expense);

    saveExpenses();

    displayExpenses();

    updateSummary();

    renderChart();

    expenseForm.reset();
});

// ======================
// DISPLAY EXPENSES
// ======================

function displayExpenses(data = expenses) {

    expenseTableBody.innerHTML = "";

    if (data.length === 0) {

        expenseTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    No expenses found
                </td>
            </tr>
        `;

        return;
    }

    data.forEach((expense) => {

        expenseTableBody.innerHTML += `
            <tr>

                <td>${expense.title}</td>

                <td>₹${Number(expense.amount).toLocaleString()}</td>

                <td>${expense.category}</td>

                <td>${expense.date}</td>

                <td>

                    <button
                        class="btn btn-warning btn-sm me-2"
                        onclick="editExpense(${expense.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteExpense(${expense.id})"
                    >
                        Delete
                    </button>

                </td>

            </tr>
        `;
    });
}

function filterExpenses() {

    const searchValue =
        searchInput.value.toLowerCase();

    const selectedCategory =
        filterCategory.value;

    let filteredExpenses = expenses.filter((expense) => {

        const matchesSearch =

            expense.title.toLowerCase().includes(searchValue)

            ||

            expense.category.toLowerCase().includes(searchValue);

        const matchesCategory =

            selectedCategory === "All"

            ||

            expense.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayExpenses(filteredExpenses);
}

// ======================
// DELETE EXPENSE
// ======================

function deleteExpense(id) {

    expenses = expenses.filter((expense) => expense.id !== id);

    saveExpenses();

    displayExpenses();

    updateSummary();

    renderChart();
}

function editExpense(id) {

    const expense = expenses.find(
        (expense) => expense.id === id
    );

    document.getElementById("title").value =
        expense.title;

    document.getElementById("amount").value =
        expense.amount;

    document.getElementById("category").value =
        expense.category;

    document.getElementById("date").value =
        expense.date;

    // Remove old expense
    expenses = expenses.filter(
        (expense) => expense.id !== id
    );

    saveExpenses();

    displayExpenses();

    updateSummary();

    renderChart();
}

// ======================
// SAVE TO LOCAL STORAGE
// ======================

function saveExpenses() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );
}

// ======================
// UPDATE SUMMARY
// ======================

function updateSummary() {

    const totalExpense = expenses.reduce((total, expense) => {

        return total + expense.amount;

    }, 0);

    const remaining = budget - totalExpense;

    budgetAmount.innerText = `₹${budget}`;

    expenseAmount.innerText = `₹${totalExpense}`;

    remainingAmount.innerText = `₹${remaining}`;

    // Color warning
    if (remaining < 0) {

        remainingAmount.style.color = "red";

    } else {

        remainingAmount.style.color = "white";
    }
}

function renderChart() {

    if (expenses.length === 0) {

        if (expenseChart) {
            expenseChart.destroy();
        }

        return;
    }

    const categories = {};
    
    // Calculate category totals
    expenses.forEach((expense) => {

        if (categories[expense.category]) {

            categories[expense.category] += expense.amount;

        } else {

            categories[expense.category] = expense.amount;
        }
    });

    const labels = Object.keys(categories);

    const data = Object.values(categories);

    const ctx = document
        .getElementById("expenseChart")
        .getContext("2d");

    // Destroy old chart before creating new one
    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: labels,

            datasets: [{
                label: "Expenses",

                data: data,

                backgroundColor: [
                    "#4e73df",
                    "#1cc88a",
                    "#36b9cc",
                    "#f6c23e",
                    "#e74a3b",
                    "#858796"
                ],

                borderWidth: 2
            }]
        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

// ======================
// INITIAL LOAD
// ======================

displayExpenses();

updateSummary();

renderChart();

// DARK MODE

const themeToggle =
    document.getElementById("themeToggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark-mode");

    themeToggle.innerText = "☀️ Light Mode";
}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if (
        document.body.classList.contains("dark-mode")
    ) {

        localStorage.setItem("theme", "dark");

        themeToggle.innerText = "☀️ Light Mode";

    } else {

        localStorage.setItem("theme", "light");

        themeToggle.innerText = "🌙 Dark Mode";
    }
});


// CSV

const exportBtn =
    document.getElementById("exportCSV");

exportBtn.addEventListener("click", exportCSV);

function exportCSV() {

    if (expenses.length === 0) {

        alert("No expenses to export!");

        return;
    }

    let csv =
        "Title,Amount,Category,Date\n";

    expenses.forEach((expense) => {

        csv +=
            `${expense.title},${expense.amount},${expense.category},${expense.date}\n`;
    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url =
        window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "expenses.csv";

    a.click();

    window.URL.revokeObjectURL(url);
}

document.getElementById("date").valueAsDate =
    new Date();