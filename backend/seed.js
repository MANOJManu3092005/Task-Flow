/**
 * Seed script - populates the database with demo data so the app
 * isn't empty on first run.
 *
 * Run with: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Comment.deleteMany({})
  ]);

  console.log('Creating demo users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const [john, sarah, mike] = await User.create([
    { name: 'John Carter', email: 'john@taskflow.com', password: passwordHash },
    { name: 'Sarah Lee', email: 'sarah@taskflow.com', password: passwordHash },
    { name: 'Mike Chen', email: 'mike@taskflow.com', password: passwordHash }
  ]);

  console.log('Creating demo projects...');
  const [website, mobileApp, marketing] = await Project.create([
    {
      name: 'Website Redesign',
      description: 'Refresh the marketing site with a new modern look and improved performance.',
      owner: john._id,
      members: [john._id, sarah._id, mike._id],
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21)
    },
    {
      name: 'Mobile App Launch',
      description: 'Build and ship v1.0 of the companion mobile app for iOS and Android.',
      owner: sarah._id,
      members: [sarah._id, john._id],
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45)
    },
    {
      name: 'Q3 Marketing Campaign',
      description: 'Plan and execute the Q3 product marketing campaign across channels.',
      owner: mike._id,
      members: [mike._id, sarah._id],
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10)
    }
  ]);

  console.log('Creating demo tasks...');
  const tasks = await Task.create([
    {
      title: 'Design Homepage',
      description: 'Create a new homepage layout with hero section, features, and testimonials.',
      project: website._id,
      assignedTo: john._id,
      priority: 'High',
      status: 'To Do',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5)
    },
    {
      title: 'Create Backend API',
      description: 'Set up REST endpoints for projects, tasks, and comments.',
      project: website._id,
      assignedTo: sarah._id,
      priority: 'Medium',
      status: 'In Progress',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    },
    {
      title: 'Test Login Flow',
      description: 'Write and run test cases for login and registration.',
      project: website._id,
      assignedTo: mike._id,
      priority: 'Medium',
      status: 'Review',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
    },
    {
      title: 'Setup Database',
      description: 'Configure MongoDB collections and indexes.',
      project: website._id,
      assignedTo: john._id,
      priority: 'High',
      status: 'Done',
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
    },
    {
      title: 'Design Onboarding Screens',
      description: 'Sketch and design the first-time user onboarding flow.',
      project: mobileApp._id,
      assignedTo: sarah._id,
      priority: 'High',
      status: 'To Do',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12)
    },
    {
      title: 'Implement Push Notifications',
      description: 'Integrate push notification service for task reminders.',
      project: mobileApp._id,
      assignedTo: john._id,
      priority: 'Low',
      status: 'In Progress',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20)
    },
    {
      title: 'App Store Submission',
      description: 'Prepare screenshots, description, and submit for review.',
      project: mobileApp._id,
      assignedTo: sarah._id,
      priority: 'Medium',
      status: 'To Do',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40)
    },
    {
      title: 'Write Campaign Copy',
      description: 'Draft ad copy and email content for the Q3 campaign.',
      project: marketing._id,
      assignedTo: mike._id,
      priority: 'Medium',
      status: 'In Progress',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4)
    },
    {
      title: 'Design Social Media Assets',
      description: 'Create graphics for Instagram, Twitter, and LinkedIn.',
      project: marketing._id,
      assignedTo: sarah._id,
      priority: 'Low',
      status: 'Review',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6)
    },
    {
      title: 'Launch Email Newsletter',
      description: 'Finalize and send the Q3 kickoff newsletter to subscribers.',
      project: marketing._id,
      assignedTo: mike._id,
      priority: 'High',
      status: 'Done',
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
    }
  ]);

  console.log('Creating demo comments...');
  await Comment.create([
    { task: tasks[0]._id, user: sarah._id, text: 'Should we use the new brand colors here?' },
    { task: tasks[0]._id, user: john._id, text: 'Yes, I already added them to the style guide.' },
    { task: tasks[1]._id, user: mike._id, text: 'API structure looks clean, nice work!' },
    { task: tasks[2]._id, user: john._id, text: 'Found one edge case with empty passwords, fixing now.' },
    { task: tasks[4]._id, user: john._id, text: 'Can we get these designs by Friday?' },
    { task: tasks[7]._id, user: sarah._id, text: 'Love the tone of this copy, very on-brand.' }
  ]);

  console.log('\nSeed complete! Demo login credentials:');
  console.log('  Email: john@taskflow.com   Password: password123');
  console.log('  Email: sarah@taskflow.com  Password: password123');
  console.log('  Email: mike@taskflow.com   Password: password123');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
