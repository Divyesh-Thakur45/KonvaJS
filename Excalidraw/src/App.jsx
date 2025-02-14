import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Line, Image } from "react-konva";
import { RiDragDropLine, RiRectangleFill, RiResetLeftFill } from "react-icons/ri";
import { FaCircle, FaLongArrowAltDown } from "react-icons/fa";
import { CiPen } from "react-icons/ci";
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
  const [drag, setDrag] = useState(false);
  const [color, setColor] = useState("black"); // Color state
  const stageRef = useRef(null);
  const layerRef = useRef(null);

  // Load Image into Konva
  useEffect(() => {
    if (image) {
      const img = new window.Image();
      img.src = image;
      img.onload = () => setKonvaImage(img);
    }
  }, [image]);

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
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

  // Handle Mouse Up Event (Finish Drawing)
  const handleMouseUp = () => {
    setIsDrawingRectangle(false);
    setIsDrawingCircle(false);
    setIsDrawingArrow(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 h-[200px]">
      <div className="flex flex-col items-center gap-6 rounded-lg w-[80%] h-[100%] mx-auto">
        {/* Toolbar Section */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-7 gap-4 p-6 rounded-md shadow-lg">
          {/* Drag Tool */}
          <button className="toolbar-btn" onClick={() => setDrag(!drag)}>
            <RiDragDropLine />
          </button>

          {/* Rectangle Tool */}
          <button className="toolbar-btn" onClick={() => setIsDrawingRectangle(true)}>
            <RiRectangleFill />
          </button>

          {/* Circle Tool */}
          <button className="toolbar-btn" onClick={() => setIsDrawingCircle(true)}>
            <FaCircle />
          </button>

          {/* Arrow Tool */}
          <button className="toolbar-btn" onClick={() => setIsDrawingArrow(true)}>
            <FaLongArrowAltDown />
          </button>

          {/* Pen Tool */}
          <button className="toolbar-btn" onClick={() => setIsDrawingPen(true)}>
            <CiPen />
          </button>

          {/* Color Picker */}
          <div className="toolbar-btn p-1">
            <input
              type="color"
              className="w-10 h-10 bg-transparent cursor-pointer rounded-md"
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          {/* Reset Button */}
          <button className="toolbar-btn" onClick={handleReset}>
            <RiResetLeftFill />
          </button>
        </div>

        {/* Action Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[100%]">
          {/* Image Upload */}
          <label className="flex items-center justify-center border border-gray-300 hover:border-blue-500 transition duration-300 cursor-pointer rounded-md p-3 shadow-lg text-gray-700">
            <input type="file" onChange={handleImageUpload} className="hidden" />
            📂 Upload Image
          </label>

          {/* Export Image */}
          <button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md shadow-lg transition duration-300"
          >
            Export Image
          </button>
        </div>
      </div>

      {/* KonvaJS Canvas */}
      <div className="relative border-2">
        <Stage
          ref={stageRef}
          width={1400}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer ref={layerRef}>
            {/* Background Image */}
            {konvaImage && <Image image={konvaImage} x={50} y={50} width={500} height={500} draggable={drag} />}

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
