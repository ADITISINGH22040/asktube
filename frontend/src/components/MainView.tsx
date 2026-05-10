import { useState } from 'react';
import { api, ApiError } from '../utils/api';
import type { CreateDigestResponse, AskVideoResponse, ChatMessage } from '../types/api';

interface MainViewProps {
  videoId: number;
  videoTitle: string;
  onBack: () => void;
}

export function MainView({ videoId, videoTitle, onBack }: MainViewProps) {
  const [activeTab, setActiveTab] = useState<'digest' | 'ask'>('digest');
  const [digest, setDigest] = useState<string | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestError, setDigestError] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const loadDigest = async () => {
    if (digest !== null) return; // Already loaded

    setDigestLoading(true);
    setDigestError(null);

    try {
      const response: CreateDigestResponse = await api.createDigest(videoId);
      setDigest(response.contentMarkdown);
    } catch (err) {
      if (err instanceof ApiError) {
        setDigestError(err.message);
      } else {
        setDigestError('Failed to load digest. Please try again.');
      }
    } finally {
      setDigestLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentQuestion.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentQuestion,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentQuestion('');
    setChatLoading(true);
    setChatError(null);

    try {
      const response: AskVideoResponse = await api.askVideo(videoId, {
        question: currentQuestion,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      if (err instanceof ApiError) {
        setChatError(err.message);
      } else {
        setChatError('Failed to get answer. Please try again.');
      }
    } finally {
      setChatLoading(false);
    }
  };

  const handleTabChange = (tab: 'digest' | 'ask') => {
    setActiveTab(tab);
    if (tab === 'digest') {
      loadDigest();
    }
  };

  // Load digest when component mounts if digest tab is active
  if (activeTab === 'digest' && digest === null && !digestLoading && !digestError) {
    loadDigest();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              ← Back
            </button>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 truncate">{videoTitle}</h1>
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('digest')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'digest'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Digest
            </button>
            <button
              onClick={() => handleTabChange('ask')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ask'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ask AI
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'digest' && (
            <div className="bg-white rounded-lg shadow p-6">
              {digestLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Generating digest...</span>
                </div>
              )}

              {digestError && (
                <div className="text-center py-12">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                    {digestError}
                  </div>
                  <button
                    onClick={loadDigest}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {digest && (
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: digest.replace(/\n/g, '<br>') }} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'ask' && (
            <div className="bg-white rounded-lg shadow">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    Ask a question about this video to get started
                  </div>
                )}

                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 text-xs opacity-75">
                          Sources: {message.sources.map(s => `chunk ${s.chunkIndex + 1}`).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                {chatError && (
                  <div className="flex justify-start">
                    <div className="bg-red-50 border border-red-200 text-red-700 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                      <p className="text-sm">{chatError}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleAskQuestion} className="border-t p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="Ask a question about this video..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !currentQuestion.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Ask
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
