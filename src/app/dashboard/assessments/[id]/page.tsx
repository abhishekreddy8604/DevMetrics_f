"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, User, Bot, Zap, X, Upload, ChevronRight, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Modality, RTClient, RTInputAudioItem, RTResponse, Item } from "rt-client";
import { AudioHandler } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FeedbackView } from "@/components/feedback-view"; // Update this import path
import { CodeEditor } from "@/components/code-editor";
import axios from 'axios';

interface Message {
  type: "user" | "assistant" | "status";
  content: string;
}

const Page = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true); // Add this line
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const clientRef = useRef<RTClient | null>(null);
  const audioHandlerRef = useRef<AudioHandler | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);

  const { id: assessmentId } = useParams();

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'text/plain') {
      setError('Please upload a .txt file');
      return;
    }

    try {
      // Read the text content of the file
      const text = await file.text();
      
      // Send the text content to the API
      const response = await fetch(`/api/assessments/${assessmentId}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resumeContent: text })
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const { content } = await response.json();
      setResumeContent(content);
    } catch (error) {
      setError('Failed to upload resume');
    }
  };

  const handleSubmitInterview = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/assessments/${assessmentId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) throw new Error('Failed to complete interview');
      
      router.push(`/dashboard/assessments/${assessmentId}/feedback`);
    } catch (error) {
      setError('Failed to submit interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanup = async () => {
    try {
      // Stop recording if active
      if (isRecording && audioHandlerRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for recording to stop
        audioHandlerRef.current.stopRecording();
        setIsRecording(false);
      }
      
      // Clear audio playback with delay
      if (audioHandlerRef.current?.isPlaying) {
        await new Promise(resolve => setTimeout(resolve, 300));
        audioHandlerRef.current.stopStreamingPlayback();
      }

      // Close client connection with delay
      if (clientRef.current) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          await clientRef.current.close();
        } catch (e) {
          console.error("Error closing client:", e);
        } finally {
          clientRef.current = null;
        }
      }

      // Close audio handler with delay
      if (audioHandlerRef.current) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          await audioHandlerRef.current.close();
        } catch (e) {
          console.error("Error closing audio handler:", e);
        } finally {
          audioHandlerRef.current = null;
        }
      }

      // Final delay to ensure all connections are cleared
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error during cleanup:", error);
      throw error;
    }
  };

  const initializeClient = async () => {
    try {
      setError(null);
      const isAzure = process.env.NEXT_PUBLIC_USE_AZURE === 'true';
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      const azureEndpoint = process.env.NEXT_PUBLIC_AZURE_ENDPOINT;
      const azureDeployment = process.env.NEXT_PUBLIC_AZURE_DEPLOYMENT;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      console.log("Initializing with config:", { isAzure, hasKey: !!apiKey, hasEndpoint: !!azureEndpoint });

      let client;
      try {
        client = isAzure
          ? new RTClient(
              new URL(azureEndpoint!),
              { key: apiKey },
              { deployment: azureDeployment! }
            )
          : new RTClient(
              { key: apiKey },
              { model: "gpt-4-turbo-preview" }
            );

        await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay before configuration
        
        client.configure({
          input_audio_transcription: { 
            model: "whisper-1"
          },
          turn_detection: null,
          temperature: 0.7,
          modalities: ["text", "audio"]
        });

        clientRef.current = client;
        setIsConnected(true);

        // Send initial message and wait for response
        const initialMessage: Item = { // Add type annotation
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text", // Changed from "text" to "input_text"
              text: `You are a professional software engineer tasked with conducting a technical interview using the following guidelines:

Resume Review:

Thoroughly review the provided resume content.
Identify the candidate's technical skills, experiences, and projects as detailed in the resume.
Interview Flow:

Start by introducing yourself and explaining the interview process. Make sure the candidate is comfotable and ready for the questions.

Single Question at a Time: Ask one technical question at a time, ensuring that each question is directly related to the skills and experiences mentioned in the resume.
Wait for Response: After asking each question, pause and wait for the candidate’s response before proceeding to the next question.
Follow-Up Questions: If necessary, ask follow-up questions that further explore the candidate's understanding and expertise based on their answer.
Feedback Guidelines:

Constructive Feedback: After each candidate response, provide concise, clear, and constructive feedback. Focus on what was done well and what could be improved, referring specifically to the technical content of the answer.
Encouragement and Clarity: Ensure that the feedback encourages further discussion and exploration of the topic.
Focus on Technical Skills:

Concentrate on technical areas highlighted in the resume, such as programming languages, frameworks, system design, algorithms, data structures, and any relevant projects or technologies.
Tailor your questions to test both theoretical understanding and practical application of these skills.
Response Style:

Keep your questions, follow-up inquiries, and feedback concise and clear.
Avoid overly verbose explanations that may confuse or overwhelm the candidate.
Do Not Reveal Answers:

Refrain from providing the candidate with the correct answers during the interview.
Ensure that feedback remains constructive without giving away the solution.
Use the following resume content as the basis for your interview:

${resumeContent}`
            }
          ]
        };

        console.log("Sending initial message");
        await client.sendItem(initialMessage);
        
        console.log("Generating response");
        await client.generateResponse();
        
        console.log("Starting response listener");
        startResponseListener();

      } catch (e) {
        console.error("RTClient initialization error:", e);
        throw new Error('Failed to initialize chat service');
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setError(error instanceof Error ? error.message : 'Failed to initialize connection');
      await handleDisconnect();
    }
  };

  const handleReconnect = async () => {
    console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
    await cleanup();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before reconnecting
    await initializeClient();
  };

  const handleResponse = async (response: RTResponse) => {
    for await (const item of response) {
      if (item.type === "message" && item.role === "assistant") {
        const message: Message = {
          type: item.role,
          content: "",
        };
        setMessages((prevMessages) => [...prevMessages, message]);
        
        for await (const content of item) {
          if (content.type === "text") {
            for await (const text of content.textChunks()) {
              message.content += text;
              setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1].content = message.content;
                return updatedMessages;
              });
            }
          } else if (content.type === "audio") {
            const textTask = async () => {
              for await (const text of content.transcriptChunks()) {
                message.content += text;
                setMessages((prevMessages) => {
                  const updatedMessages = [...prevMessages];
                  updatedMessages[updatedMessages.length - 1].content = message.content;
                  return updatedMessages;
                });
              }
            };
            const audioTask = async () => {
              audioHandlerRef.current?.startStreamingPlayback();
              for await (const audio of content.audioChunks()) {
                audioHandlerRef.current?.playChunk(audio);
              }
            };
            await Promise.all([textTask(), audioTask()]);
          }
        }
      }
    }
  };

  const handleInputAudio = async (item: RTInputAudioItem) => {
    audioHandlerRef.current?.stopStreamingPlayback();
    await item.waitForCompletion();
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        type: "user",
        content: item.transcription || "",
      },
    ]);
  };

  const startResponseListener = async () => {
    if (!clientRef.current) return;

    try {
      console.log("Starting response listener");
      for await (const serverEvent of clientRef.current.events()) {
        console.log("Received server event:", serverEvent);
        if (serverEvent.type === "response") {
          await handleResponse(serverEvent);
        } else if (serverEvent.type === "input_audio") {
          await handleInputAudio(serverEvent);
        }
      }
    } catch (error) {
      console.error("Response iteration error:", error);
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        await handleReconnect();
      } else {
        setError('Connection lost. Please try again later.');
        await handleDisconnect();
      }
    }
  };

  const sendMessage = async () => {
    if (currentMessage.trim() && clientRef.current) {
      try {
        const newMessage: Message = { type: "user", content: currentMessage }; // Explicit type annotation
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Save message to database
        await fetch(`/api/assessments/${assessmentId}/conversation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [newMessage] })
        });

        await clientRef.current.sendItem({
          type: "message",
          role: "user",
          content: [{ 
            type: "input_text", // Make sure this is "input_text"
            text: currentMessage 
          }]
        });
        await clientRef.current.generateResponse();
        setCurrentMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const toggleRecording = async () => {
    if (!isRecording && clientRef.current) {
      try {
        if (!audioHandlerRef.current) {
          audioHandlerRef.current = new AudioHandler();
          await audioHandlerRef.current.initialize();
        }
        await audioHandlerRef.current.startRecording(async (chunk) => {
          await clientRef.current?.sendAudio(chunk);
        });
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    } else if (audioHandlerRef.current) {
      try {
        audioHandlerRef.current.stopRecording();
        const inputAudio = await clientRef.current?.commitAudio();
        await handleInputAudio(inputAudio!);
        await clientRef.current?.generateResponse();
        setIsRecording(false);
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
    }
  };

  const handleStartChat = async () => {
    if (!resumeContent) {
      setError('Please upload your resume first');
      return;
    }

    try {
      // Clean up any existing connections first
      await cleanup();
      
      // Initialize audio handler first
      const handler = new AudioHandler();
      await handler.initialize();
      audioHandlerRef.current = handler;
      
      // Then initialize the client
      await initializeClient();
      
      setShowInstructions(false);
    } catch (error) {
      console.error("Failed to start chat:", error);
      setError('Failed to start chat. Please try again.');
      setIsConnected(false);
      setShowInstructions(true);
      await cleanup();
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true); // Start loading state
      
      // Perform cleanup
      await cleanup();
      
      // Reset all states
      setIsConnected(false);
      setShowInstructions(true);
      setMessages([]);
      setCurrentMessage("");
      setIsRecording(false);
      setError(null);
      reconnectAttempts.current = 0;

      // Force garbage collection of audio contexts
      if (window.gc) {
        window.gc();
      }
    } catch (error) {
      console.error("Error during disconnect:", error);
      setError('Failed to disconnect properly. Please refresh the page.');
      // Force reload as last resort
      if (error instanceof Error && error.message.includes('audio')) {
        window.location.reload();
      }
    } finally {
      setIsDisconnecting(false); // End loading state
    }
  };

  const handleRunCode = async (code: string) => {
    try {
      const response = await axios.post('/api/code/execute', {
        code,
        language,
      });
      setOutput(response.data.output);
    } catch (error) {
      console.error('Failed to execute code:', error);
      setError('Failed to execute code');
    }
  };

  const handleSubmitCode = async (code: string) => {
    try {
      await fetch(`/api/assessments/${assessmentId}/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
    } catch (error) {
      console.error('Failed to submit code:', error);
      setError('Failed to submit code');
    }
  };

  useEffect(() => {
    return () => {
      cleanup().catch(console.error);
    };
  }, []);

  useEffect(() => {
    if (error) {
      cleanup().catch(console.error);
    }
  }, [error]);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${assessmentId}`);
        if (!response.ok) throw new Error('Failed to fetch assessment');
        const data = await response.json();
        setAssessment(data);
        
        // If assessment is completed, show feedback
        if (data.status === "COMPLETED") {
          setShowInstructions(false);
          setIsConnected(false);
        }
      } catch (error) {
        console.error("Failed to fetch assessment:", error);
        setError('Failed to load assessment details');
      }
    };

    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  if (assessment?.status === "COMPLETED") {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{assessment.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">
              {assessment.status}
            </span>
            <span>•</span>
            <span>Type: {assessment.type}</span>
            <span>•</span>
            <span>Score: {assessment.score || 0}</span>
          </div>
        </div>
        <FeedbackView feedback={assessment.feedback} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {error && (
        <Card className="max-w-2xl mx-auto bg-red-50">
          <CardContent className="py-2 sm:py-4">
            <div className="flex items-center text-red-600">
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      {showInstructions ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold">Welcome to Voice Chat</CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Before we begin, please upload your resume and review the instructions
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Add Resume Upload Section */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4">Upload Resume</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <label 
                      htmlFor="resume-upload" 
                      className="cursor-pointer text-sm text-blue-500 hover:text-blue-600"
                    >
                      Click to upload resume
                    </label>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".txt"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500">
                      Supported format: TXT file only
                    </p>
                  </div>
                </div>
                {resumeContent && (
                  <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                    Resume uploaded successfully!
                  </div>
                )}
              </div>
            </div>

            {/* Existing Instructions Section */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">Instructions:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Ensure you are in a quiet environment</li>
                <li>Hold the Push to Talk button while speaking</li>
                <li>Release the button to send your message</li>
                <li>Wait for the AI response before speaking again</li>
                <li>You can also type messages using the text input</li>
              </ul>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <Button 
                onClick={handleStartChat}
                className="w-full max-w-sm"
                size="lg"
                variant="default"
                disabled={!resumeContent} // Disable if no resume
              >
                <Zap className="w-4 h-4 mr-2" />
                {resumeContent ? 'Start Conversation' : 'Please upload resume first'}
              </Button>
              <p className="text-sm text-muted-foreground">
                {resumeContent 
                  ? 'Click to begin your conversation with the AI'
                  : 'Upload your resume to continue'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !isConnected ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p>Connecting...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col h-[calc(100vh-2rem)] gap-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Technical Interview</h1>
            <div className="flex gap-2">
              <Button
                size="default"
                variant={isRecording ? "destructive" : "default"}
                onMouseDown={toggleRecording}
                onMouseUp={toggleRecording}
                onTouchStart={toggleRecording}
                onTouchEnd={toggleRecording}
                disabled={!isConnected || isSubmitting}
                className="w-full sm:w-40"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    <span className="text-sm">Release to Send</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    <span className="text-sm">Push to Talk</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                size="default"
                disabled={isDisconnecting || isSubmitting}
                className="w-full sm:w-auto"
              >
                {isDisconnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-2 flex-1 min-h-0">
            {/* Chat Panel */}
            <div className={cn(
              "flex flex-col transition-all duration-300",
              isEditorCollapsed ? "flex-1" : "w-1/2"
            )}>
              <Card className="flex-1 flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle>Conversation</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3 max-h-[350px] sm:max-h-[400px] overflow-y-auto p-2 sm:p-4 bg-gray-50 rounded-lg">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex",
                          message.type === "user" ? "justify-end" : "justify-start"
                        )}>
                        <div
                          className={cn(
                            "max-w-[90%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg text-sm sm:text-base",
                            message.type === "user" 
                              ? "bg-blue-500 text-white" 
                              : "bg-white"
                          )}>
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <div className="flex gap-2 sm:gap-3 w-full">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyUp={(e) => e.key === "Enter" && !isSubmitting && sendMessage()}
                      disabled={!isConnected || isSubmitting}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!isConnected || isSubmitting}
                      variant="default"
                      size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Collapse Toggle */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                className="h-8 px-1 hover:bg-gray-100"
              >
                {isEditorCollapsed ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Code Editor Panel */}
            <div className={cn(
              "flex flex-col transition-all duration-300 overflow-y-auto",
              isEditorCollapsed 
                ? "w-0 overflow-hidden opacity-0" 
                : "w-1/2 opacity-100"
            )}>
              {!isEditorCollapsed && (
                <div className="flex flex-col h-full gap-4 pb-4"> {/* Added pb-4 for bottom padding */}
                  <Card className="flex-shrink-0"> {/* Changed to flex-shrink-0 */}
                    <CardHeader className="border-b">
                      <CardTitle>Code Editor</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 h-[400px]"> {/* Reduced height */}
                      <CodeEditor
                        code={code}
                        onChange={setCode}
                        language={language}
                        onLanguageChange={setLanguage}
                        onRun={handleRunCode}
                        onSubmit={handleSubmitCode}
                      />
                    </CardContent>
                  </Card>

                  {output && (
                    <Card className="flex-shrink-0"> {/* Added flex-shrink-0 */}
                      <CardHeader className="py-2 border-b">
                        <CardTitle className="text-sm">Output</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-sm max-h-[150px] overflow-y-auto font-mono">
                          {output}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t mt-auto">
            <Button 
              onClick={handleSubmitInterview}
              variant="default"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Interview..." : "Submit Interview"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;