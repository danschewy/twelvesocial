# TwelveSocial - AI Video Clip Generator

Transform long videos into engaging social media clips using AI-powered analysis and automated clip generation.

## Features

- 🎬 **Video Upload & Processing**: Upload videos and process them with Twelve Labs AI
- 🤖 **AI Chat Assistant**: Conversational AI to help you find the perfect clips
- 🔍 **Smart Video Search**: Find specific moments using visual, audio, and text search
- ✂️ **Automated Clip Generation**: Create social media-ready clips automatically
- 📱 **Social Media Ready**: Optimized for Instagram, TikTok, YouTube Shorts, and more

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and add your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Required: Twelve Labs API Key
TWELVE_LABS_API_KEY=your_twelve_labs_api_key_here

# Required: OpenAI API Key (for AI chat assistant)
OPENAI_API_KEY=your_openai_api_key_here
```

**Getting API Keys:**
- **Twelve Labs**: Sign up at [twelvelabs.io](https://twelvelabs.io) and get your API key
- **OpenAI**: Get your API key from [platform.openai.com](https://platform.openai.com)

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating video clips!

## How It Works

1. **Upload Your Video**: Drag and drop or select your video file
2. **AI Processing**: Twelve Labs analyzes your video content
3. **Chat with AI**: Describe what clips you want to create
4. **Generate Clips**: AI finds and creates your perfect social media clips
5. **Download & Share**: Get your clips ready for social media

## Recent Improvements

### AI Chat Assistant (Latest Update)
- ✅ **Upgraded to GPT-4o**: Much smarter and more helpful responses
- ✅ **Better UX**: Typing indicators, loading states, auto-scroll
- ✅ **Enhanced Error Handling**: Clear error messages and better validation
- ✅ **Conversational Flow**: More natural, friendly interactions

### Core Features
- ✅ **Video Upload**: Working with Twelve Labs integration
- ✅ **Video Processing**: Automatic indexing and analysis
- ✅ **Video Search**: Find specific content in your videos
- ⚠️ **Clip Generation**: Basic version working, FFmpeg integration in progress

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI Services**: OpenAI GPT-4o, Twelve Labs Video AI
- **Video Processing**: Twelve Labs API, FFmpeg (planned)
- **Chat**: LangChain for conversation management

## Development

This project uses:
- [Next.js](https://nextjs.org) - React framework
- [Twelve Labs](https://twelvelabs.io) - Video AI platform
- [OpenAI](https://openai.com) - AI chat assistant
- [LangChain](https://langchain.com) - AI conversation management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
