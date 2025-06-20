# DBGT E-Procurement System

A modern e-procurement system for Dakshin Bharat Gateway Terminal Private Limited.

## Features

- Secure vendor authentication
- Vendor registration with unique IDs
- Quotation submission and management
- Multi-category product/service classification
- Responsive and user-friendly interface

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma (PostgreSQL)
- NextAuth.js

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd dbgt-e-procurement
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://user:password@localhost:5432/dbgt_procurement"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # UI components
├── lib/                   # Utility functions
└── types/                # TypeScript types
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited. 