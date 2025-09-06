import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Eye, RotateCcw, Smile, Focus, Gauge } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LivenessStatusProps {
  faceData: {
    isBlinking: boolean;
    headPoseValid: boolean;
    landmarks: any[];
    isSmiling: boolean;
    eyeGazeDirection: string;
    faceDistance: string;
    expressionConfidence: number;
  };
}

export const LivenessStatus: React.FC<LivenessStatusProps> = ({ faceData }) => {
  const [blinkHistory, setBlinkHistory] = useState<boolean[]>([]);
  const [isRealUser, setIsRealUser] = useState(false);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [blinkCount, setBlinkCount] = useState(0);

  // Handle blink detection and history tracking
  useEffect(() => {
    const now = Date.now();
    
    if (faceData.isBlinking && now - lastBlinkTime > 300) {
      setLastBlinkTime(now);
      setBlinkCount(prev => prev + 1);
      setBlinkHistory(prev => [...prev.slice(-10), true]);
    } else if (!faceData.isBlinking && faceData.landmarks.length > 0) {
      setBlinkHistory(prev => [...prev.slice(-10), false]);
    }
  }, [faceData.isBlinking, faceData.landmarks.length]); // Removed lastBlinkTime dependency

  // Enhanced liveness calculation with multiple factors
  useEffect(() => {
    const hasFaceDetection = faceData.landmarks.length > 0;
    const hasValidHeadPose = faceData.headPoseValid;
    const hasRecentBlinks = blinkHistory.slice(-5).some(blink => blink);
    const hasEnoughBlinks = blinkCount >= 2;
    const hasGoodDistance = faceData.faceDistance === 'optimal' || faceData.faceDistance === 'close';
    const hasHighConfidence = faceData.expressionConfidence > 0.7;
    const hasCenterGaze = faceData.eyeGazeDirection === 'center';

    // More sophisticated liveness validation
    const realUser = hasFaceDetection && 
                    hasValidHeadPose && 
                    (hasRecentBlinks || hasEnoughBlinks) && 
                    hasGoodDistance && 
                    hasHighConfidence &&
                    hasCenterGaze;
    setIsRealUser(realUser);
  }, [faceData.landmarks.length, faceData.headPoseValid, blinkHistory, blinkCount, faceData.faceDistance, faceData.expressionConfidence, faceData.eyeGazeDirection]);

  const resetDetection = () => {
    setBlinkHistory([]);
    setBlinkCount(0);
    setLastBlinkTime(0);
  };

  const statusClass = isRealUser ? 'status-real' : 'status-spoof';
  const StatusIcon = isRealUser ? Shield : AlertTriangle;

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card className={`p-6 text-center ${statusClass} border-0`}>
        <div className="flex flex-col items-center space-y-4">
          <StatusIcon className="w-16 h-16 text-white" />
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isRealUser ? '🟢 Real User Detected' : '🔴 Spoof Detected'}
            </h2>
            <p className="text-white/80 mt-2">
              {isRealUser 
                ? 'Liveness validation successful' 
                : 'Please look at the camera and blink naturally'
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Enhanced Detection Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Eye className={`w-6 h-6 ${faceData.landmarks.length > 0 ? 'text-success' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-medium">Face Detection</p>
              <p className="text-sm text-muted-foreground">
                {faceData.landmarks.length > 0 ? 'Active' : 'No face detected'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <RotateCcw className={`w-6 h-6 ${faceData.headPoseValid ? 'text-success' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-medium">Head Pose</p>
              <p className="text-sm text-muted-foreground">
                {faceData.headPoseValid ? 'Frontal' : 'Turn to face camera'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Smile className={`w-6 h-6 ${faceData.isSmiling ? 'text-success' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-medium">Expression</p>
              <p className="text-sm text-muted-foreground">
                {faceData.isSmiling ? 'Smiling' : 'Neutral'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Focus className={`w-6 h-6 ${faceData.eyeGazeDirection === 'center' ? 'text-success' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-medium">Eye Gaze</p>
              <p className="text-sm text-muted-foreground">
                Looking {faceData.eyeGazeDirection}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Gauge className={`w-6 h-6 ${faceData.faceDistance === 'optimal' ? 'text-success' : faceData.faceDistance === 'close' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-medium">Distance</p>
              <p className="text-sm text-muted-foreground">
                {faceData.faceDistance === 'optimal' ? 'Perfect' : faceData.faceDistance === 'close' ? 'Too close' : faceData.faceDistance === 'far' ? 'Too far' : 'Unknown'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full ${faceData.expressionConfidence > 0.8 ? 'bg-success' : faceData.expressionConfidence > 0.5 ? 'bg-yellow-500' : 'bg-muted'}`} />
            <div>
              <p className="font-medium">Confidence</p>
              <p className="text-sm text-muted-foreground">
                {Math.round(faceData.expressionConfidence * 100)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Blink Counter */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Blink Detection</p>
            <p className="text-sm text-muted-foreground">
              Blinks detected: {blinkCount}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${faceData.isBlinking ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
            <span className="text-sm">{faceData.isBlinking ? 'Blinking' : 'Eyes open'}</span>
          </div>
        </div>
      </Card>

      {/* Reset Button */}
      <button
        onClick={resetDetection}
        className="w-full py-2 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors"
      >
        Reset Detection
      </button>

      {/* Enhanced Instructions */}
      <Card className="p-4 bg-muted/50">
        <h3 className="font-medium mb-2">Enhanced Liveness Detection</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Position your face in the center at optimal distance</li>
          <li>• Look directly at the camera (center gaze)</li>
          <li>• Blink naturally 2-3 times</li>
          <li>• Keep your head frontal and still</li>
          <li>• Maintain good lighting and clear visibility</li>
          <li>• System analyzes: blinking, gaze, distance, expressions</li>
        </ul>
      </Card>
    </div>
  );
};