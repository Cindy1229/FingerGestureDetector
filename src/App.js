import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { useRef, useState, useEffect } from "react";
import { drawHand } from "./utilities.js";
import * as fp from "fingerpose";
import victory from "./emoji/victory.png";
import thumbs_up from "./emoji/thumbs_up.png";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [emoji, setEmoji] = useState(null);
  const images = { thumbs_up: thumbs_up, victory: victory };

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded");

    setInterval(() => {
      detect(net);
    }, 100);

    const detect = async (net) => {
      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const hand = await net.estimateHands(video);
        console.log(hand);

        if (hand.length > 0) {
          const GE = new fp.GestureEstimator([
            fp.Gestures.VictoryGesture,
            fp.Gestures.ThumbsUpGesture,
          ]);
          const gesture = await GE.estimate(hand[0].landmarks, 4);
          console.log(gesture);

          if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
            const confidence = gesture.gestures.map(
              (prediction) => prediction.confidence
            );
            const maxConfidence = confidence.indexOf(
              Math.max.apply(null, confidence)
            );
            setEmoji(gesture.gestures[maxConfidence].name);
            console.log(emoji);
          }
        }

        const ctx = canvasRef.current.getContext("2d");
        drawHand(hand, ctx);
      }
    };
  };

  useEffect(() => {
    runHandpose();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 20,
            zIndex: 100,
          }}
        >
          <h2>The Gesture is:</h2>
          {emoji !== null ? (
            <img
              src={images[emoji]}
              style={{ width: 30, height: 30, paddingTop: 30, paddingLeft: 10 }}
            />
          ) : (
            ""
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
