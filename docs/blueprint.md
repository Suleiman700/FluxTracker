# **App Name**: FluxTracker

## Core Features:

- Salary Input: Input monthly salary to set the budget baseline.
- Payment Management: Add one-time and recurring payments with details like date, name, description, and amount. Recurring payments will automatically generate monthly instances with progress tracking notes (e.g., 'Payment X (1/8)'). The user will be able to edit each existing payment.
- Financial Overview: Display the total amount paid, total unpaid, and remaining salary after expenses for each month. Show upcoming installments and related payment progress clearly. The user can navigate between months using 'next' and 'previous' buttons.
- Data Persistence: Use file storage (JSON files) to save payment data without a database.
- AI-Powered Budget Tips: Suggest budget adjustments based on spending trends using a generative AI tool.

## Style Guidelines:

- Primary color: A serene blue (#64B5F6) to evoke trust and clarity in financial tracking.
- Background color: Light, desaturated blue (#E3F2FD) to ensure a calm, uncluttered visual space.
- Accent color: A complementary orange (#FFA726) to highlight key actions and financial insights, contrasting for emphasis.
- Clean, modern font for clear readability across all data and interface elements.
- Use minimalist icons to represent different payment categories and actions.
- Dashboard layout organized by month with clear sections for salary, payments, and summary. Should be responsive for different screen sizes.
- Subtle transitions and animations to provide feedback when adding, editing, or marking payments as paid.