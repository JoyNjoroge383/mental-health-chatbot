#!/bin/bash

echo "🚀 Starting Mental Health Chatbot Setup..."

# --- Backend Setup ---
echo "🐍 Setting up Python backend..."

# Check for Python
if ! command -v python3 &> /dev/null
then
    echo "Python 3 could not be found. Please install it to continue."
    exit 1
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
else
    echo "Virtual environment already exists."
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies from requirements.txt..."
pip install -r requirements.txt

echo "✅ Backend setup complete."

# --- Frontend Setup ---
echo "💻 Setting up Node.js frontend..."

# Check for Node.js and npm
if ! command -v npm &> /dev/null
then
    echo "npm could not be found. Please install Node.js and npm to continue."
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

echo "✅ Frontend setup complete."

# --- Final Instructions ---
echo -e "\n🎉 Setup finished successfully!"
echo "To run the application, follow these steps:"
echo "1. In your current terminal (with the venv activated), start the backend:"
echo "   python app.py"
echo "2. Open a new terminal, navigate to the 'frontend' directory, and start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo "3. Don't forget to create a .env file with your API keys. See README.md for details."
echo "Happy coding! ✨"
