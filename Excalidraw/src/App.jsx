import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Line, Image, Group } from "react-konva";
import { RiDragDropLine, RiRectangleFill, RiResetLeftFill } from "react-icons/ri";
import { FaCircle, FaLongArrowAltDown } from "react-icons/fa";
import { FcCursor } from "react-icons/fc";
import { FcAddImage } from "react-icons/fc";
import { FcEditImage } from "react-icons/fc";
import { TiExport } from "react-icons/ti";
import "./App.css";

export default function App() {
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [penLines, setPenLines] = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);
  const [image, setImage] = useState();
  const [konvaImage, setKonvaImage] = useState(null);
  const [secondImage, setSecondImage] = useState();
  const [konvaSecondImage, setKonvaSecondImage] = useState(null);
  const [drag, setDrag] = useState(false);
  const [color, setColor] = useState("black");
  const [points, setPoints] = useState([]);
  const [isClosed, setIsClosed] = useState(false);
  const [showPolygonBorder, setShowPolygonBorder] = useState(false);

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
    setRectangles([]);
    setCircles([]);
    setArrows([]);
    setPenLines([]);
    setPoints([]);
    setIsClosed(false);
    setShowPolygonBorder(false);
  };

  // Handle Mouse Down Event on Stage (Start Drawing)
  const handleMouseDown = (e) => {
    if (drag) return; // If drag mode is on, do not create new shapes

    const stage = stageRef.current;
    const mousePos = stage.getPointerPosition();

    setIsDrawing(true);

    if (currentTool === "rectangle") {
      setCurrentShape({ x: mousePos.x, y: mousePos.y, width: 0, height: 0 });
    } else if (currentTool === "circle") {
      setCurrentShape({ x: mousePos.x, y: mousePos.y, radius: 0 });
    } else if (currentTool === "arrow") {
      setCurrentShape({ points: [mousePos.x, mousePos.y, mousePos.x, mousePos.y] });
    } else if (currentTool === "pen") {
      setCurrentShape({ points: [mousePos.x, mousePos.y] });
    }
  };

  // Handle Mouse Move Event (Resize Shapes)
  const handleMouseMove = (e) => {
    if (!isDrawing || !currentShape || drag) return;

    const stage = stageRef.current;
    const mousePos = stage.getPointerPosition();

    if (currentTool === "rectangle") {
      setCurrentShape((prev) => ({
        ...prev,
        width: mousePos.x - prev.x,
        height: mousePos.y - prev.y,
      }));
    } else if (currentTool === "circle") {
      setCurrentShape((prev) => ({
        ...prev,
        radius: Math.sqrt(Math.pow(mousePos.x - prev.x, 2) + Math.pow(mousePos.y - prev.y, 2)),
      }));
    } else if (currentTool === "arrow") {
      setCurrentShape((prev) => ({
        points: [prev.points[0], prev.points[1], mousePos.x, mousePos.y],
      }));
    } else if (currentTool === "pen") {
      setCurrentShape((prev) => ({
        points: [...prev.points, mousePos.x, mousePos.y],
      }));
    }
  };

  // Handle Mouse Up Event (Finish Drawing)
  const handleMouseUp = () => {
    if (!isDrawing || !currentShape || drag) return;

    setIsDrawing(false);

    if (currentTool === "rectangle") {
      setRectangles([...rectangles, currentShape]);
    } else if (currentTool === "circle") {
      setCircles([...circles, currentShape]);
    } else if (currentTool === "arrow") {
      setArrows([...arrows, currentShape]);
    } else if (currentTool === "pen") {
      setPenLines([...penLines, currentShape]);
    }

    setCurrentShape(null);
  };

  const handleClick = (e) => {
    if (isClosed || drag || !showPolygonBorder) return; // Stop if polygon is already closed, in drag mode, or edit tool is not active

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

  // Handle Edit Tool Click
  const handleEditToolClick = () => {
    setShowPolygonBorder(true); // Show polygon border when edit tool is clicked
    setCurrentTool(null); // Reset current tool
    setDrag(false); // Disable drag mode
  };

  return (
    <div className="flex items-center h-[auto] w-[80%]">
      <div className="flex flex-col items-center gap-6 w-[auto] mt-[40px] p-6 bg-white rounded-lg shadow-xl h-[90vh] overflow-y-scroll">
        {/* Toolbar Section */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-1 gap-4 p-4 rounded-md bg-gray-100 shadow-md">
          {/* Edit Tool */}
          <button
            className="toolbar-btn group flex flex-col items-center justify-center gap-2"
            onClick={handleEditToolClick}
          >
            <FcEditImage className="text-2xl group-hover:text-blue-500 transition" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Edit Image</span>
          </button>

          {/* Cursor Tool */}
          <button
            className="toolbar-btn group flex flex-col items-center justify-center gap-2"
            onClick={() => {
              setDrag(!drag);
              setCurrentTool(null); // Reset current tool when switching to cursor
            }}
          >
            <FcCursor className="text-2xl group-hover:text-blue-500 transition" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Cursor</span>
          </button>

          {/* Rectangle Tool */}
          <button
            className="toolbar-btn group flex flex-col items-center justify-center gap-2"
            onClick={() => {
              setCurrentTool("rectangle");
              setDrag(false); // Disable drag mode when selecting a shape tool
            }}
          >
            <RiRectangleFill className="text-2xl group-hover:text-blue-500 transition" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Rectangle</span>
          </button>

          {/* Circle Tool */}
          <button
            className="toolbar-btn group flex flex-col items-center justify-center gap-2"
            onClick={() => {
              setCurrentTool("circle");
              setDrag(false); // Disable drag mode when selecting a shape tool
            }}
          >
            <FaCircle className="text-2xl group-hover:text-blue-500 transition" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Circle</span>
          </button>

          {/* Arrow Tool */}
          <button
            className="toolbar-btn group flex flex-col items-center justify-center gap-2"
            onClick={() => {
              setCurrentTool("arrow");
              setDrag(false); // Disable drag mode when selecting a shape tool
            }}
          >
            <FaLongArrowAltDown className="text-2xl group-hover:text-blue-500 transition" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Arrow</span>
          </button>

          {/* Pen Tool */}
          <button
            className="toolbar-btn group flex flex-col items-center justify-center gap-2"
            onClick={() => {
              setCurrentTool("pen");
              setDrag(false); // Disable drag mode when selecting a shape tool
            }}
          >
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
          <button
            className="toolbar-btn group flex flex-col items-center justify-center gap-2"
            onClick={handleReset}
          >
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

            {/* Render Polygon Border */}
            {showPolygonBorder && points.length > 1 && (
              <Line
                points={points}
                stroke={color}
                strokeWidth={2}
                closed={true}
              />
            )}

            {/* Render Points */}
            {showPolygonBorder &&
              points.map((point, index) => {
                if (index % 2 !== 0) return null; // Skip odd indices
                return (
                  <Circle
                    key={index}
                    x={points[index]}
                    y={points[index + 1]}
                    radius={1}
                    stroke={color}
                    strokeWidth={2}
                    fill={color}
                  />
                );
              })}

            {rectangles.map((rect, i) => (
              <Rect key={i} {...rect} fill={color} stroke="black" strokeWidth={2} draggable={drag} />
            ))}
            {circles.map((circle, i) => (
              <Circle key={i} {...circle} fill={color} stroke="black" strokeWidth={2} draggable={drag} />
            ))}
            {arrows.map((arrow, i) => (
              <Line key={i} {...arrow} stroke={color} strokeWidth={2} draggable={drag} />
            ))}
            {penLines.map((pen, i) => (
              <Line key={i} {...pen} stroke={color} strokeWidth={2} tension={0.5} lineCap="round" lineJoin="round" draggable={drag} />
            ))}

            {/* Render Current Shape Being Drawn */}
            {currentShape && (
              <>
                {currentTool === "rectangle" && (
                  <Rect
                    x={currentShape.x}
                    y={currentShape.y}
                    width={currentShape.width}
                    height={currentShape.height}
                    stroke={color}
                    strokeWidth={2}
                  />
                )}
                {currentTool === "circle" && (
                  <Circle
                    x={currentShape.x}
                    y={currentShape.y}
                    radius={currentShape.radius}
                    stroke={color}
                    strokeWidth={2}
                  />
                )}
                {currentTool === "arrow" && (
                  <Line
                    points={currentShape.points}
                    stroke={color}
                    strokeWidth={2}
                  />
                )}
                {currentTool === "pen" && (
                  <Line
                    points={currentShape.points}
                    stroke={color}
                    strokeWidth={2}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
              </>
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}