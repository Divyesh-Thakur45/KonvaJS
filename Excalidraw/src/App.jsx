import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Image } from "react-konva";
import { RiDragDropLine } from "react-icons/ri";
import { RiRectangleFill } from "react-icons/ri";
import { FaCircle } from "react-icons/fa";
import { FaLongArrowAltDown } from "react-icons/fa";
import { CiPen } from "react-icons/ci";
import { RiResetLeftFill } from "react-icons/ri";
import "./App.css";

export default function App() {
  const [image, setImage] = useState(null);
  const [konvaImage, setKonvaImage] = useState(null);
  const stageRef = useRef(null);

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
      reader.onload = (event) => {
        setImage(event.target.result);
      };
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

  return (
    <div className="flex flex-col items-center gap-4 h-[200px]">

      <div className="flex flex-col items-center gap-6 rounded-lg  w-[80%] h-[100%] mx-auto">
        {/* Toolbar Section */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-7 gap-4 p-6 rounded-md shadow-lg">
          {/* Drag Tool */}
          <button className="toolbar-btn">
            <RiDragDropLine />
          </button>

          {/* Rectangle Tool */}
          <button className="toolbar-btn">
            <RiRectangleFill />
          </button>

          {/* Circle Tool */}
          <button className="toolbar-btn">
            <FaCircle />
          </button>

          {/* Arrow Tool */}
          <button className="toolbar-btn">
            <FaLongArrowAltDown />
          </button>

          {/* Pen Tool */}
          <button className="toolbar-btn">
            <CiPen />
          </button>

          {/* Color Picker */}
          <div className="toolbar-btn p-1">
            <input type="color" className="w-10 h-10 bg-transparent cursor-pointer rounded-md" />
          </div>

          {/* Reset Button */}
          <button className="toolbar-btn">
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
        <Stage ref={stageRef} width={1400} height={500}>
          <Layer>
            {/* Background Image */}
            {konvaImage && <Image image={konvaImage} x={50} y={50} width={500} height={500} draggable />}

            {/* Draggable Shapes */}
            <Rect
              x={100}
              y={100}
              width={200}
              height={200}
              fill="red"
              stroke="black"
              strokeWidth={2}
              draggable
            />
            <Circle x={200} y={200} stroke="black" fill="yellow" draggable radius={50} />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};