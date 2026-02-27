import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import TaskType from '../models/TaskType.js';

// Load environment variables from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const initialTaskTypes = [
  {
    name: 'Lookup Data',
    description: 'Retrieve or query data from a source',
    field_schema: {
      fields: [
        {
          name: 'data_source',
          label: 'Data Source',
          type: 'text',
          required: true,
          placeholder: 'e.g., Customer Database, API endpoint'
        },
        {
          name: 'query_parameters',
          label: 'Query Parameters',
          type: 'text',
          required: false,
          placeholder: 'e.g., customer_id, date_range'
        }
      ]
    },
    icon: '🔍',
    is_active: true
  },
  {
    name: 'Change Data',
    description: 'Create, update, or delete data in a system',
    field_schema: {
      fields: [
        {
          name: 'target_system',
          label: 'Target System',
          type: 'text',
          required: true,
          placeholder: 'e.g., CRM, Database, API'
        },
        {
          name: 'operation',
          label: 'Operation',
          type: 'select',
          required: true,
          options: ['Create', 'Update', 'Delete']
        },
        {
          name: 'fields_to_change',
          label: 'Fields to Change',
          type: 'text',
          required: true,
          placeholder: 'e.g., status, email, phone_number'
        }
      ]
    },
    icon: '✏️',
    is_active: true
  },
  {
    name: 'Notify',
    description: 'Send notifications to users or systems',
    field_schema: {
      fields: [
        {
          name: 'recipient',
          label: 'Recipient',
          type: 'text',
          required: true,
          placeholder: 'e.g., user@example.com, #channel, phone number'
        },
        {
          name: 'notification_type',
          label: 'Notification Type',
          type: 'select',
          required: true,
          options: ['Email', 'SMS', 'Slack']
        },
        {
          name: 'message_template',
          label: 'Message Template',
          type: 'text',
          required: true,
          placeholder: 'Message content or template name'
        }
      ]
    },
    icon: '��',
    is_active: true
  }
];

async function seedTaskTypes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing task types (optional - comment out if you want to preserve existing data)
    // await TaskType.deleteMany({});
    // console.log('Cleared existing task types');

    // Insert initial task types
    for (const taskType of initialTaskTypes) {
      await TaskType.findOneAndUpdate(
        { name: taskType.name },
        taskType,
        { upsert: true, new: true }
      );
      console.log(`✓ Seeded task type: ${taskType.name}`);
    }

    console.log('\n✓ Task types seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding task types:', error);
    process.exit(1);
  }
}

seedTaskTypes();
