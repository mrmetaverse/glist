# Environment Variables Documentation

This document provides comprehensive documentation for the environment variables required by this application. Use this as a reference when setting up your development or production environment.

## Overview

The application requires several environment variables to function properly. These variables are used for:
- Supabase authentication and database access
- OpenAI API integration
- Other critical application functionality

## Important Security Notes

⚠️ **NEVER commit your actual `.env` file to version control!**
- The `.env` file contains sensitive credentials that should be kept private
- Always use `.env.example` as a template and create your own `.env` file locally
- Add `.env` to your `.gitignore` file to prevent accidental commits

## Required Environment Variables

### Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Description**: The public URL of your Supabase project
- **Format**: `https://<project-id>.supabase.co`
- **How to obtain**:
  1. Log in to your [Supabase Dashboard](https://app.supabase.com)
  2. Select your project
  3. Go to Project Settings
  4. The URL is listed under "Project URL"

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Description**: Public anonymous key for client-side Supabase operations
- **Format**: Long alphanumeric string
- **How to obtain**:
  1. Log in to your [Supabase Dashboard](https://app.supabase.com)
  2. Select your project
  3. Go to Project Settings > API
  4. Copy the "anon public" key under "Project API keys"

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Description**: Service role key for privileged server-side Supabase operations
- **Format**: Long alphanumeric string
- **Security Warning**: ⚠️ This key has admin privileges. Never expose it to the client side!
- **How to obtain**:
  1. Log in to your [Supabase Dashboard](https://app.supabase.com)
  2. Select your project
  3. Go to Project Settings > API
  4. Copy the "service_role" key under "Project API keys"

### OpenAI Configuration

#### `OPENAI_API_KEY`
- **Description**: API key for OpenAI services (chat, agent execution, audio transcription)
- **Format**: `sk-...` (starts with "sk-" followed by alphanumeric characters)
- **How to obtain**:
  1. Log in to your [OpenAI Dashboard](https://platform.openai.com/account/api-keys)
  2. Click "Create new secret key"
  3. Give your key a name and copy it immediately (you won't be able to see it again)

## Example .env File Template

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
```

## Setting Up Your Environment

1. Create a new file named `.env` in the root directory of your project
2. Copy the template above into your `.env` file
3. Replace each placeholder value with your actual credentials
4. Verify that `.env` is listed in your `.gitignore` file
5. Restart your development server to apply the new environment variables

## Troubleshooting

If you encounter issues:
1. Verify that all required variables are properly set
2. Check for any typos in variable names
3. Ensure the values are properly formatted
4. Confirm that your API keys have the necessary permissions
5. Try restarting your development server after making changes

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
