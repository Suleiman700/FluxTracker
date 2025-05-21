
# FluxTracker - Personal Finance & Expense Management

FluxTracker is a web application designed to help you manage your monthly finances, track expenses, and gain insights into your spending habits. It's built with a modern tech stack and offers AI-powered budget suggestions.

## Key Features

*   **Monthly Expense Tracking**: Log all your payments, whether one-time or recurring.
*   **Month-Specific Salary Input**: Set a different income amount for each month.
*   **Payment Categorization**: Create, read, update, and delete custom spending categories and assign them to your payments.
*   **Recurring Payments**: Easily manage payments that occur regularly (e.g., monthly subscriptions, loan installments).
*   **Financial Summary**: Get a clear overview of your total paid and unpaid expenses for the selected month, and see your remaining salary after all listed expenses.
*   **Spending by Category Chart**: Visualize your paid expenses by category with an intuitive bar chart for the selected month.
*   **AI-Powered Budget Tips**: Receive personalized suggestions from an AI to help improve your budgeting and saving strategies (requires a Google AI API key).
*   **Multi-Month Payment Timeline**: View a scrollable timeline of your payments spanning the current month, 6 months prior, and 6 months ahead.
*   **Data Export**: Download all your financial data (salaries, payments, categories) as a JSON file.
*   **Intuitive Interface**: Navigate through months easily and manage your financial data with a clean, user-friendly dashboard.

## Tech Stack

*   **Frontend**: Next.js (App Router), React, TypeScript
*   **UI Components**: ShadCN UI
*   **Styling**: Tailwind CSS
*   **AI Integration**: Genkit (for Google AI's Gemini model)
*   **Data Storage**: Local JSON file (`flux-tracker-data.json`) on the server.

## Getting Started

Follow these steps to get FluxTracker running on your local machine.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm (npm is used in the examples)

### Installation & Setup

1.  **Clone the Repository (if applicable)**:
    If you're working outside of Firebase Studio, clone the repository to your local machine.
    ```bash
    git clone <repository-url>
    cd fluxtracker-project # Or your project's directory name
    ```

2.  **Install Dependencies**:
    Navigate to the project directory and install the necessary packages.
    ```bash
    npm install
    ```
    (or `yarn install` or `pnpm install`)

3.  **Set Up Environment Variables**:
    Create a `.env` file in the root of your project. This file is used to store sensitive information like API keys.
    ```
    touch .env
    ```
    To use the AI-powered budget tips feature, you'll need a Google AI API key:
    *   Go to [Google AI Studio (makersuite.google.com)](https://makersuite.google.com/).
    *   Sign in and create a new API key.
    *   Add the API key to your `.env` file:
        ```env
        GOOGLE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
        ```
    *If you don't add an API key, the AI features will not work, but the rest of the application will function normally.*

4.  **Run the Development Server**:
    Start the Next.js development server.
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002` (as per your `package.json` script).

5.  **Run Genkit Development Server (for AI features)**:
    To enable AI features and see Genkit logs, you'll need to run the Genkit development server in a separate terminal:
    ```bash
    npm run genkit:dev
    ```
    Or, for automatic reloading on changes to AI flows:
    ```bash
    npm run genkit:watch
    ```

### How to Use

1.  **Navigate Months**: Use the month navigator at the top right to select the month you want to view or manage.
2.  **Set Monthly Salary**: In the "Settings & Insights" card, input your salary for the selected month and click "Set Salary".
3.  **Manage Categories**:
    *   Click "Manage Categories" to open a dialog where you can add new categories, edit existing ones, or delete them.
4.  **Add Payments**:
    *   Click "Add New Payment" to open the payment form.
    *   Fill in the payment details (name, amount, date, category).
    *   For recurring payments, check "Is this a recurring payment?" and specify the number of monthly installments.
5.  **Manage Payments**:
    *   Each payment is displayed as a card.
    *   **Mark as Paid/Unpaid**: Use the checkbox on each payment card.
    *   **Edit Payment**: Click the pencil icon on a payment card.
    *   **Delete Payment**: Click the trash icon on a payment card (a confirmation will appear).
6.  **View Financials**:
    *   The "Financial Overview" card shows your total paid, unpaid, and remaining salary for the selected month.
    *   The "Spending by Category" chart visualizes your paid expenses.
7.  **Get AI Budget Tips**:
    *   If you have set your monthly income and have some paid expenses, click "AI Budget Tips" in the "Settings & Insights" card. (Requires `GOOGLE_API_KEY`).
8.  **View Timeline**:
    *   Click "View Timeline" in the header to see a multi-month view of your payments. The current dashboard month will be highlighted and scrolled into view.
9.  **Export Data**: Click "Export Data as JSON" to download all your application data.

## Data Storage

FluxTracker stores all your financial data (salaries, payments, categories) in a local JSON file named `flux-tracker-data.json` in the root of the project. This file is created automatically if it doesn't exist.

---

This updated README should provide a good starting point for anyone looking at the project.
