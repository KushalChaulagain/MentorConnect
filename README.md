# MentorConnect - Nepal's Premier Developer Mentorship Platform

MentorConnect is a platform that connects aspiring developers in Nepal with experienced mentors for personalized guidance, code reviews, and career development.

## Features

- **User Authentication**: Secure login and registration system for both mentors and mentees
- **Mentor Profiles**: Detailed profiles showcasing expertise, experience, and availability
- **Booking System**: Easy-to-use session booking with mentor availability management
- **Real-time Chat**: Direct messaging between mentors and mentees
- **Code Reviews**: Submit code for review and receive detailed feedback
- **Payment Integration**: Secure payment processing for mentorship sessions
- **Review System**: Rate and review mentors after sessions

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time Features**: Pusher
- **Payment Processing**: Khalti
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/mentor-connect.git
   cd mentor-connect
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables with your own values

4. Set up the database:

   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
mentor-connect/
├── src/
│   ├── app/              # Next.js 14 app directory
│   ├── components/       # Reusable React components
│   ├── lib/             # Utility functions and configurations
│   └── styles/          # Global styles and Tailwind config
├── prisma/              # Database schema and migrations
├── public/             # Static assets
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all the mentors and mentees who are part of our community
- Special thanks to the open-source projects that made this possible
