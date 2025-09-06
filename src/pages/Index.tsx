import React, { useState } from 'react';
import { Camera } from '@/components/Camera';
import { LivenessStatus } from '@/components/LivenessStatus';
import { Card } from '@/components/ui/card';
import { Scan } from 'lucide-react';

const Index = () => {
  const [faceData, setFaceData] = useState({
    isBlinking: false,
    headPoseValid: false,
    landmarks: [],
    isSmiling: false,
    eyeGazeDirection: 'unknown',
    faceDistance: 'unknown',
    expressionConfidence: 0
  });

  const handleFaceData = (data: typeof faceData) => {
    setFaceData(data);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Scan className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Face Liveness Detection</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Advanced biometric security using real-time face analysis, blink detection, and head pose estimation
        </p>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Feed */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
                <span>📹</span>
                <span>Live Video Feed</span>
              </h2>
              <Camera onFaceData={handleFaceData} />
              <div className="mt-4 text-sm text-muted-foreground">
                <p>• Green dots show detected facial landmarks</p>
                <p>• Camera processes {faceData.landmarks.length} facial points in real-time</p>
              </div>
            </Card>
          </div>

          {/* Status Panel */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
                <span>🛡️</span>
                <span>Security Status</span>
              </h2>
              <LivenessStatus faceData={faceData} />
            </Card>
          </div>
        </div>

        {/* Technical Info */}
        <Card className="mt-8 p-6 bg-card/50">
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-primary mb-2">🎯 Face Detection</h4>
              <p className="text-muted-foreground">
                Uses MediaPipe Face Mesh to detect 468 facial landmarks in real-time with high precision
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">👁️ Blink Detection</h4>
              <p className="text-muted-foreground">
                Calculates Eye Aspect Ratio (EAR) to detect natural blinking patterns and validate liveness
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">📐 Head Pose</h4>
              <p className="text-muted-foreground">
                Analyzes facial geometry to ensure proper head positioning and frontal face orientation
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;