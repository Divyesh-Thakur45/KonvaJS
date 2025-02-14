import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Line, Image, Group } from "react-konva";
import { RiDragDropLine, RiRectangleFill, RiResetLeftFill } from "react-icons/ri";
import { FaCircle, FaLongArrowAltDown } from "react-icons/fa";
import { CiPen } from "react-icons/ci";
import { FcCursor } from "react-icons/fc";
import { FcAddImage } from "react-icons/fc";
import { TiExport } from "react-icons/ti";

import "./App.css";

export default function App() {
  const [isDrawingRectangle, setIsDrawingRectangle] = useState(false);
  const [isDrawingCircle, setIsDrawingCircle] = useState(false);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [isDrawingPen, setIsDrawingPen] = useState(false);
  const [rectProps, setRectProps] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [circleProps, setCircleProps] = useState({ x: 0, y: 0, radius: 0 });
  const [arrowProps, setArrowProps] = useState({ points: [] });
  const [penPoints, setPenPoints] = useState([]);
  const [image, setImage] = useState();
  const [konvaImage, setKonvaImage] = useState(null);
  const [secondImage, setSecondImage] = useState();
  const [konvaSecondImage, setKonvaSecondImage] = useState(null);
  const [drag, setDrag] = useState(false);
  const [color, setColor] = useState("black");
  const stageRef = useRef(null);
  const layerRef = useRef(null);

  const [points, setPoints] = useState([]); // Store polygon points
  const [isClosed, setIsClosed] = useState(false); // Track if polygon is closed

  // Load Image into Konva
  useEffect(() => {
    if (image) {
      const img = new window.Image();
      img.src = image;
      img.onload = () => setKonvaImage(img);
    }
  }, [image]);

  // Load Second Image into Konva
  useEffect(() => {
    if (secondImage) {
      const img = new window.Image();
      img.src = secondImage;
      img.onload = () => setKonvaSecondImage(img);
    }
  }, [secondImage]);

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle Second Image Upload
  const handleSecondImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setSecondImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Export Canvas as Image
  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.href = uri;
    link.download = "konva-canvas.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset Canvas
  const handleReset = () => {
    setIsDrawingRectangle(false);
    setIsDrawingCircle(false);
    setIsDrawingArrow(false);
    setIsDrawingPen(false);
    setRectProps({ x: 0, y: 0, width: 0, height: 0 });
    setCircleProps({ x: 0, y: 0, radius: 0 });
    setArrowProps({ points: [] });
    setPenPoints([]);
    setPoints([]);
    setIsClosed(false);
  };

  // Handle Mouse Down Event on Stage (Start Drawing)
  const handleMouseDown = (e) => {
    const stage = stageRef.current;
    const mousePos = stage.getPointerPosition();

    if (isDrawingRectangle) {
      setRectProps({
        x: mousePos.x,
        y: mousePos.y,
        width: 0,
        height: 0,
      });
    } else if (isDrawingCircle) {
      setCircleProps({
        x: mousePos.x,
        y: mousePos.y,
        radius: 0,
      });
    } else if (isDrawingArrow) {
      setArrowProps({
        points: [mousePos.x, mousePos.y, mousePos.x, mousePos.y],
      });
    } else if (isDrawingPen) {
      setPenPoints([mousePos.x, mousePos.y]);
    }
  };

  // Handle Mouse Move Event (Resize Shapes)
  const handleMouseMove = (e) => {
    const stage = stageRef.current;
    const mousePos = stage.getPointerPosition();

    if (isDrawingRectangle) {
      setRectProps({
        ...rectProps,
        width: mousePos.x - rectProps.x,
        height: mousePos.y - rectProps.y,
      });
    } else if (isDrawingCircle) {
      const radius = Math.sqrt(
        Math.pow(mousePos.x - circleProps.x, 2) + Math.pow(mousePos.y - circleProps.y, 2)
      );
      setCircleProps({
        ...circleProps,
        radius: radius,
      });
    } else if (isDrawingArrow) {
      setArrowProps({
        points: [arrowProps.points[0], arrowProps.points[1], mousePos.x, mousePos.y],
      });
    } else if (isDrawingPen) {
      setPenPoints([...penPoints, mousePos.x, mousePos.y]);
    }
  };

  const handleClick = (e) => {
    if (isClosed) return; // Stop if polygon is already closed

    const { x, y } = e.target.getStage().getPointerPosition();

    // If clicking near the first point, close the shape
    if (points.length >= 4) {
      const firstX = points[0];
      const firstY = points[1];

      const distance = Math.sqrt((x - firstX) ** 2 + (y - firstY) ** 2);
      if (distance < 10) {
        setIsClosed(true);
        return;
      }
    }

    setPoints([...points, x, y]);
  };

  // Handle Mouse Up Event (Finish Drawing)
  const handleMouseUp = () => {
    setIsDrawingRectangle(false);
    setIsDrawingCircle(false);
    setIsDrawingArrow(false);
  };

  return (
    <div className="flex items-center h-[auto] w-[80%]">
      <div className="flex flex-col items-center gap-6 w-[auto] mt-[40px] p-6 bg-white rounded-lg shadow-xl h-[90vh] overflow-y-scroll">
        {/* Toolbar Section */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-1 gap-4 p-4 rounded-md bg-gray-100 shadow-md">
          {/* Cursor Tool */}
          <button className="toolbar-btn group flex flex-col items-center justify-center gap-2" onClick={() => setDrag(!drag)}>
            <FcCursor className="text-2xl group-hover:text-blue-500 transition" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Cursor</span>
          </button>

          {/* Rectangle Tool */}
          <button className="toolbar-btn group flex flex-col items-center justify-center gap-2" onClick={() => setIsDrawingRectangle(true)}>
            <RiRectangleFill className="text-2xl group-hover:text-blue-500 transition" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Rectangle</span>
          </button>

          {/* Circle Tool */}
          <button className="toolbar-btn group flex flex-col items-center justify-center gap-2" onClick={() => setIsDrawingCircle(true)}>
            <FaCircle className="text-2xl group-hover:text-blue-500 transition" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Circle</span>
          </button>

          {/* Arrow Tool */}
          <button className="toolbar-btn group flex flex-col items-center justify-center gap-2" onClick={() => setIsDrawingArrow(true)}>
            <FaLongArrowAltDown className="text-2xl group-hover:text-blue-500 transition" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Arrow</span>
          </button>

          {/* Pen Tool */}
          <button className="toolbar-btn group flex flex-col items-center justify-center gap-2" onClick={() => setIsDrawingPen(true)}>
            <span className="text-2xl group-hover:text-blue-500 transition">✒️</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Pen</span>
          </button>

          {/* Color Picker */}
          <div className="toolbar-btn flex flex-col items-center">
            <input
              type="color"
              className="w-10 h-10 bg-transparent cursor-pointer rounded-md border border-gray-300"
              onChange={(e) => setColor(e.target.value)}
            />
            <span className="text-sm font-medium text-gray-700 mt-1">Color</span>
          </div>

          {/* Reset Button */}
          <button className="toolbar-btn group flex flex-col items-center justify-center gap-2" onClick={handleReset}>
            <RiResetLeftFill className="text-2xl group-hover:text-red-500 transition" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">Reset</span>
          </button>
        </div>

        {/* Action Section */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 w-full max-w-lg">
          {/* Image Upload */}
          <label className="flex flex-col items-center justify-center gap-2 border border-gray-300 bg-white hover:border-blue-500 transition duration-300 cursor-pointer rounded-md p-4 shadow-lg text-gray-700">
            <input type="file" onChange={handleImageUpload} className="hidden" />
            <FcAddImage className="text-3xl" />
            <span className="text-sm font-medium">Upload Project</span>
          </label>

          {/* Second Image Upload */}
          <label className="flex flex-col items-center justify-center gap-2 border border-gray-300 bg-white hover:border-blue-500 transition duration-300 cursor-pointer rounded-md p-4 shadow-lg text-gray-700">
            <input type="file" onChange={handleSecondImageUpload} className="hidden" />
            <span className="text-3xl">🖌️</span>
            <span className="text-sm font-medium">Upload Design</span>
          </label>

          {/* Export Image */}
          <button
            onClick={handleExport}
            className="flex flex-col items-center justify-center gap-2 border border-gray-300 bg-white hover:border-green-500 transition duration-300 cursor-pointer rounded-md p-4 shadow-lg text-gray-700"
          >
            <TiExport className="text-3xl text-green-600" />
            <span className="text-sm font-medium">Export Image</span>
          </button>
        </div>
      </div>


      {/* KonvaJS Canvas */}
      <div className="border-2 ml-[230px]">
        <Stage
          ref={stageRef}
          width={800}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
        >
          <Layer ref={layerRef}>
            {/* Background Image */}
            {konvaImage && <Image image={konvaImage} x={50} y={50} width={500} height={500} draggable={drag} />}

            {/* Render the Polygon */}
            {points.length > 1 && (
              <Group
                clipFunc={(ctx) => {
                  ctx.beginPath();
                  ctx.moveTo(points[0], points[1]);
                  for (let i = 2; i < points.length; i += 2) {
                    ctx.lineTo(points[i], points[i + 1]);
                  }
                  ctx.closePath();
                }}
              >
                {/* Second Image inside the Polygon */}
                {konvaSecondImage && (
                  <Image
                    image={konvaSecondImage}
                    x={Math.min(...points.filter((_, i) => i % 2 === 0))}
                    y={Math.min(...points.filter((_, i) => i % 2 !== 0))}
                    width={Math.max(...points.filter((_, i) => i % 2 === 0)) - Math.min(...points.filter((_, i) => i % 2 === 0))}
                    height={Math.max(...points.filter((_, i) => i % 2 !== 0)) - Math.min(...points.filter((_, i) => i % 2 !== 0))}
                  />
                )}
              </Group>
            )}

            {/* Render Points */}
            {points.map((point, index) => {
              if (index % 2 !== 0) return null; // Skip odd indices
              return (
                <Circle
                  key={index}
                  x={points[index]}
                  y={points[index + 1]}
                  radius={1}
                  fill={color}
                />
              );
            })}

            {/* Rectangle */}
            {isDrawingRectangle && (
              <Rect
                x={rectProps.x}
                y={rectProps.y}
                width={rectProps.width}
                height={rectProps.height}
                fill={color}
                stroke="black"
                strokeWidth={2}
                draggable={drag}
              />
            )}

            {/* Circle */}
            {isDrawingCircle && (
              <Circle
                x={circleProps.x}
                y={circleProps.y}
                radius={circleProps.radius}
                fill={color}
                stroke="black"
                strokeWidth={2}
                draggable={drag}
              />
            )}

            {/* Arrow */}
            {isDrawingArrow && (
              <Line
                points={arrowProps.points}
                stroke={color}
                strokeWidth={2}
                fill={color}
                draggable={drag}
              />
            )}

            {/* Pen */}
            {isDrawingPen && (
              <Line
                points={penPoints}
                stroke={color}
                strokeWidth={2}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                draggable={drag}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}