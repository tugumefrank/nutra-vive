# Cron-Jobs.org Setup Guide

This guide explains how to set up your order cleanup cron job using cron-jobs.org instead of Vercel cron jobs.

## 🔧 Environment Setup

1. **Add to your `.env` file:**
```bash
CRON_SECRET_TOKEN=your-very-secure-random-token-here-make-it-long-and-unique
```

2. **Add to Vercel environment variables:**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add the environment variable:
     - **Name:** `CRON_SECRET_TOKEN`
     - **Value:** `your-very-secure-random-token-here-make-it-long-and-unique`

## 🌐 cron-jobs.org Configuration

### Step 1: Create Account
1. Go to [cron-jobs.org](https://cron-jobs.org)
2. Sign up for a free account

### Step 2: Add New Cron Job
1. Click "Add cronjob"
2. Fill in the details:

**Basic Settings:**
- **Title:** `Nutra-Vive Order Cleanup`
- **URL:** `https://your-domain.vercel.app/api/cron/cleanup-pending-orders`
- **Request method:** `GET`

**Schedule (choose one):**
- **Every 6 hours:** `0 */6 * * *`
- **Daily at 2 AM:** `0 2 * * *`
- **Every 4 hours:** `0 */4 * * *`

### Step 3: Advanced Settings
Click "Advanced" and configure:

**HTTP Authentication:**
- **Username:** `cron-service` (can be any value)
- **Password:** `your-very-secure-random-token-here-make-it-long-and-unique` (same as env variable)

**Headers:**
- **Key:** `Authorization`
- **Value:** `Bearer your-very-secure-random-token-here-make-it-long-and-unique`

**Timeout:**
- Set to `30` seconds (cleanup might take a moment)

**Failed executions:**
- Enable email notifications for failures

## 🔒 Security Notes

1. **Token Generation:** Use a strong, random token. Example:
   ```bash
   # Generate a secure token (Linux/Mac)
   openssl rand -base64 32
   
   # Or use online generator like: https://www.uuidgenerator.net/
   ```

2. **Keep Token Secret:** Never commit the token to your repository

3. **Monitor Logs:** Check Vercel function logs to ensure cleanup is working

## 📊 Monitoring

### Check Execution Logs:
1. **cron-jobs.org dashboard:** Shows execution history and status
2. **Vercel function logs:** Shows detailed cleanup results
3. **Database:** Monitor that old pending orders are being removed

### Expected Response:
```json
{
  "success": true,
  "deletedCount": 5,
  "message": "Cron cleanup completed: 5 orders deleted",
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

## 🚨 Troubleshooting

### 401 Unauthorized Error:
- Check that `CRON_SECRET_TOKEN` is set in Vercel
- Verify the Authorization header value matches exactly
- Ensure the token doesn't have extra spaces or characters

### 500 Server Error:
- Check Vercel function logs for detailed error messages
- Verify database connection is working
- Ensure the cleanup function isn't timing out

### No Orders Being Deleted:
- Check if you have pending orders older than 20 hours
- Verify the cleanup logic is working by checking function logs

## 🔄 Switching from Vercel Cron

If you were using Vercel cron jobs:

1. **Remove vercel.json cron configuration:**
   ```json
   // Remove or comment out:
   {
     "crons": [
       {
         "path": "/api/cron/cleanup-pending-orders",
         "schedule": "0 */6 * * *"
       }
     ]
   }
   ```

2. **Keep the endpoint:** The same endpoint works for both services

3. **Update environment:** Add the `CRON_SECRET_TOKEN` as shown above

## ✅ Testing

Test your setup:

1. **Manual test via cron-jobs.org:**
   - Use the "Execute now" button in your cron job dashboard

2. **Check response:**
   - Should return 200 status code
   - Should show success message with cleanup results

3. **Verify in database:**
   - Check that old pending orders are removed as expected

Your order cleanup system is now ready to run automatically via cron-jobs.org!