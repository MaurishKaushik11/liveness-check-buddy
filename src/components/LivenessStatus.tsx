import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Eye, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LivenessStatusProps {
  faceData: {
    isBlinking: boolean;
    headPoseValid: boolean;
    landmarks: any[];
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

  // Calculate liveness status separately
  useEffect(() => {
    const hasFaceDetection = faceData.landmarks.length > 0;
    const hasValidHeadPose = faceData.headPoseValid;
    const hasRecentBlinks = blinkHistory.slice(-5).some(blink => blink);
    const hasEnoughBlinks = blinkCount >= 2;

    const realUser = hasFaceDetection && hasValidHeadPose && (hasRecentBlinks || hasEnoughBlinks);
    setIsRealUser(realUser);
  }, [faceData.landmarks.length, faceData.headPoseValid, blinkHistory, blinkCount]);

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

      {/* Detection Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Instructions */}
      <Card className="p-4 bg-muted/50">
        <h3 className="font-medium mb-2">Instructions</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Position your face in the center of the camera</li>
          <li>• Look directly at the camera</li>
          <li>• Blink naturally a few times</li>
          <li>• Keep your head relatively still</li>
        </ul>
      </Card>
    </div>
  );
};