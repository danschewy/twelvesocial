# Environment Setup Instructions for TwelveSocial

## Quick Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get your API keys:**
   - **Twelve Labs API Key**: https://playground.twelvelabs.io/
   - **OpenAI API Key**: https://platform.openai.com/api-keys

3. **Edit `.env.local` with your actual keys:**
   ```bash
   # Replace with your actual keys
   TWELVE_LABS_API_KEY=your_actual_twelve_labs_key_here
   OPENAI_API_KEY=your_actual_openai_key_here
   ```

4. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Detailed Environment Configuration

### Required API Keys

#### Twelve Labs API Key
- **Purpose**: Video upload, processing, indexing, and search
- **Get it from**: https://playground.twelvelabs.io/
- **Account needed**: Free tier available
- **Usage**: Used for all video-related operations

#### OpenAI API Key  
- **Purpose**: AI chat functionality (GPT-4o model)
- **Get it from**: https://platform.openai.com/api-keys
- **Account needed**: Paid account required (GPT-4o is not free)
- **Usage**: Powers the intelligent chat interface

### Environment File Template

Create a `.env.local` file with this content:

```bash
# =============================================================================
# TWELVESOCIAL - ENVIRONMENT CONFIGURATION
# =============================================================================

# Twelve Labs API Configuration (REQUIRED)
TWELVE_LABS_API_KEY=your_twelve_labs_api_key_here

# OpenAI API Configuration (REQUIRED)
OPENAI_API_KEY=your_openai_api_key_here

# Development Settings
NODE_ENV=development
```

## Troubleshooting

### Common Issues

1. **"API key not found" errors**
   - Verify your keys are correctly copied (no extra spaces)
   - Make sure the file is named `.env.local` (not `.env.local.txt`)
   - Restart the development server after adding keys

2. **OpenAI rate limit errors**
   - Check your OpenAI account usage limits
   - Verify you have sufficient credits
   - GPT-4o requires a paid OpenAI account

3. **Video upload failures**
   - Verify your Twelve Labs API key is valid
   - Check your Twelve Labs account status and limits
   - Ensure video file is in supported format (MP4, MOV, etc.)

4. **Chat not working**
   - Verify OpenAI API key is correct
   - Check browser console for specific error messages
   - Ensure you have GPT-4o access (paid account required)

### Testing Your Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the application:**
   - Go to http://localhost:3000
   - Navigate to the upload page

3. **Test video upload:**
   - Upload a short video file
   - Wait for processing to complete
   - Verify the video appears in the list

4. **Test AI chat:**
   - Try sending a message in the chat interface
   - Verify you get intelligent responses
   - Test asking about creating clips

## Recent Improvements

The application has been significantly improved with:

- ✅ **Better AI Model**: Upgraded to GPT-4o for much smarter responses
- ✅ **Improved UX**: Added typing indicators, loading states, auto-scroll
- ✅ **Fixed Search**: Corrected Twelve Labs API search options
- ✅ **Chat Memory**: AI remembers conversation context
- ✅ **Video Context**: AI knows when videos are uploaded
- ✅ **Error Handling**: Better error messages and recovery
- ✅ **HLS.js Fix**: Resolved console errors in video playback

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API keys are correct and have sufficient limits
3. Ensure you're using supported video formats
4. Try restarting the development server

The application should now provide a much smoother experience with intelligent AI responses and reliable video processing! 