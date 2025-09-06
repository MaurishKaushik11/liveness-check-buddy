import React, { useRef, useEffect, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';

interface CameraProps {
  onFaceData: (faceData: {
    isBlinking: boolean;
    headPoseValid: boolean;
    landmarks: any[];
  }) => void;
}

export const Camera: React.FC<CameraProps> = ({ onFaceData }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Face mesh and camera instances
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);

  // Eye aspect ratio calculation for blink detection
  const calculateEAR = (eyeLandmarks: number[][]) => {
    // Calculate Eye Aspect Ratio using landmark points
    const p1 = eyeLandmarks[1];
    const p2 = eyeLandmarks[5];
    const p3 = eyeLandmarks[2]; 
    const p4 = eyeLandmarks[4];
    const p5 = eyeLandmarks[0];
    const p6 = eyeLandmarks[3];

    // Vertical distances
    const v1 = Math.sqrt(Math.pow(p2[0] - p6[0], 2) + Math.pow(p2[1] - p6[1], 2));
    const v2 = Math.sqrt(Math.pow(p3[0] - p5[0], 2) + Math.pow(p3[1] - p5[1], 2));
    
    // Horizontal distance
    const h = Math.sqrt(Math.pow(p1[0] - p4[0], 2) + Math.pow(p1[1] - p4[1], 2));
    
    return (v1 + v2) / (2 * h);
  };

  // Head pose estimation using key facial landmarks
  const calculateHeadPose = (landmarks: any[]) => {
    if (landmarks.length === 0) return false;
    
    // Use nose tip and other key points to estimate head orientation
    const noseTip = landmarks[1]; // Nose tip
    const leftEye = landmarks[33]; // Left eye corner
    const rightEye = landmarks[263]; // Right eye corner
    const chin = landmarks[17]; // Chin
    
    // Simple head pose validation based on landmark positions
    const eyeDistance = Math.abs(leftEye.x - rightEye.x);
    const noseToEyeRatio = Math.abs(noseTip.x - (leftEye.x + rightEye.x) / 2) / eyeDistance;
    
    // Head is roughly frontal if nose is centered between eyes
    return noseToEyeRatio < 0.3; // Threshold for frontal face
  };

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        // Initialize MediaPipe Face Mesh
        const faceMesh = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMesh.onResults((results) => {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          
          if (canvas && video) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Clear canvas
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              // Draw video frame
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
                const landmarks = results.multiFaceLandmarks[0];
                
                // Draw face landmarks
                ctx.fillStyle = '#00FFFF';
                landmarks.forEach((landmark: any) => {
                  ctx.beginPath();
                  ctx.arc(
                    landmark.x * canvas.width,
                    landmark.y * canvas.height,
                    1,
                    0,
                    2 * Math.PI
                  );
                  ctx.fill();
                });

                // Eye landmarks for blink detection
                const leftEyeLandmarks = [
                  [landmarks[33].x * canvas.width, landmarks[33].y * canvas.height],
                  [landmarks[7].x * canvas.width, landmarks[7].y * canvas.height],
                  [landmarks[163].x * canvas.width, landmarks[163].y * canvas.height],
                  [landmarks[144].x * canvas.width, landmarks[144].y * canvas.height],
                  [landmarks[145].x * canvas.width, landmarks[145].y * canvas.height],
                  [landmarks[153].x * canvas.width, landmarks[153].y * canvas.height]
                ];

                const rightEyeLandmarks = [
                  [landmarks[362].x * canvas.width, landmarks[362].y * canvas.height],
                  [landmarks[382].x * canvas.width, landmarks[382].y * canvas.height],
                  [landmarks[381].x * canvas.width, landmarks[381].y * canvas.height],
                  [landmarks[380].x * canvas.width, landmarks[380].y * canvas.height],
                  [landmarks[374].x * canvas.width, landmarks[374].y * canvas.height],
                  [landmarks[373].x * canvas.width, landmarks[373].y * canvas.height]
                ];

                // Calculate EAR for both eyes
                const leftEAR = calculateEAR(leftEyeLandmarks);
                const rightEAR = calculateEAR(rightEyeLandmarks);
                const avgEAR = (leftEAR + rightEAR) / 2;

                // Blink detection (EAR threshold)
                const isBlinking = avgEAR < 0.25;
                
                // Head pose validation
                const headPoseValid = calculateHeadPose(landmarks);

                // Send face data to parent component
                onFaceData({
                  isBlinking,
                  headPoseValid,
                  landmarks: landmarks
                });
              } else {
                // No face detected
                onFaceData({
                  isBlinking: false,
                  headPoseValid: false,
                  landmarks: []
                });
              }
            }
          }
        });

        faceMeshRef.current = faceMesh;

        // Initialize camera
        if (videoRef.current) {
          const camera = new MediaPipeCamera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current) {
                await faceMesh.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });
          
          cameraRef.current = camera;
          await camera.start();
          setIsLoading(false);
        }
      } catch (err) {
        setError('Failed to initialize camera: ' + (err as Error).message);
        setIsLoading(false);
      }
    };

    initializeCamera();

    return () => {
      // Cleanup
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [onFaceData]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-card rounded-lg border">
        <div className="text-center">
          <p className="text-destructive mb-2">Camera Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className={`w-full h-auto rounded-lg border tech-glow ${
          isLoading ? 'opacity-50' : 'opacity-100'
        }`}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Initializing camera...</p>
          </div>
        </div>
      )}
    </div>
  );
};