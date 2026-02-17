import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button, Space, message, Upload, Tooltip, Input, Modal } from 'antd';
import {
  UndoOutlined,
  ClearOutlined,
  UploadOutlined,
  EditOutlined, // Optional: for editing text later?
  HighlightOutlined, // Pen
  FontSizeOutlined, // Text
  DotChartOutlined, // Circle
  DragOutlined, // Select/Move
  DeleteOutlined // Delete selected
} from '@ant-design/icons';

const BodyAnnotation = forwardRef(({
  value,
  onChange,
  disabled = false,
  defaultImageUrl = null
}, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Tools: 'pen', 'circle', 'text', 'select'
  const [tool, setTool] = useState('pen');

  const [color, setColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(5); // For pen and circle stroke
  const [fontSize, setFontSize] = useState(14); // For text

  // Elements: includes strokes, circles, text
  // Structure: { type: 'freehand'|'circle'|'text', points: [], color, lineWidth, center: {x,y}, radius, text, fontSize }
  const [elements, setElements] = useState([]);

  const [currentElement, setCurrentElement] = useState(null);
  const [imageUrl, setImageUrl] = useState(defaultImageUrl);
  const [localFile, setLocalFile] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);

  // Selection / Dragging State
  const [selectedElementIndex, setSelectedElementIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState(null);

  // Text Input State
  const [textInputVisible, setTextInputVisible] = useState(false);
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
  const [textInputValue, setTextInputValue] = useState('');

  // 👇 EXPOSE METHODS KE PARENT VIA REF
  useImperativeHandle(ref, () => ({
    getLocalFile: () => localFile,
    hasLocalFile: () => !!localFile,
    getImageUrl: () => imageUrl,
    clearLocalFile: () => setLocalFile(null),
    setUploadedImageUrl: (url) => {
      setImageUrl(url);
      setLocalFile(null);
    },
    // Export canvas as image (gambar + annotation jadi satu)
    exportAsImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      // Pastikan redraw dulu biar bersih (tanpa selection highlight)
      if (backgroundImage) {
        redrawCanvas(elements, backgroundImage, null); // Pass null for selection to avoid drawing bounds
      }

      return canvas.toDataURL('image/jpeg', 0.9);
    },
    // Buat cek apakah ada annotation
    hasAnnotations: () => elements.length > 0
  }));

  // Parse incoming value from database
  useEffect(() => {
    if (value) {
      try {
        // Coba parse dulu, mungkin JSON
        const parsed = JSON.parse(value);

        if (parsed.strokes) {
          // Backward compatibility: map old strokes to new elements structure if needed
          const loadedElements = parsed.strokes.map(s => ({
            ...s,
            type: s.type || 'freehand'
          }));
          setElements(loadedElements);
        }

        // Ambil imageUrl dari JSON atau langsung dari value (kalo udah string URL)
        const url = parsed.imageUrl || parsed;
        if (url) {
          setImageUrl(url);
        }
      } catch (e) {
        // Kalo bukan JSON, berarti udah string URL langsung
        console.log('Value is direct URL:', value);
        setImageUrl(value);
      }
    }
  }, [value]);

  // Load and draw background image
  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        setBackgroundImage(img);

        const canvas = canvasRef.current;
        const maxWidth = canvas.parentElement.offsetWidth;
        const maxHeight = 600;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        redrawCanvas(elements, img, selectedElementIndex);
        setCanvasInitialized(true);
      };

      img.src = imageUrl;
    }
  }, [imageUrl]);

  // Redraw canvas when elements change or selection changes
  useEffect(() => {
    if (canvasInitialized && backgroundImage) {
      redrawCanvas(elements, backgroundImage, selectedElementIndex);
    }
  }, [elements, canvasInitialized, backgroundImage, selectedElementIndex]);

  const redrawCanvas = (elementsToDraw, bgImage, selectedIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }

    // Use a specific order? 
    // Usually we draw elements in order.
    // If we want the selected element to be on top, we could handle that but keeping order is standard.
    // However, the highlight should be drawn on top.

    elementsToDraw.forEach((el, index) => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color; // For text fill
      ctx.lineWidth = el.lineWidth || 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'freehand') {
        if (!el.points || el.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();

        // Highlight if selected (simple bounding box or glow?)
        if (index === selectedIdx) {
          ctx.save();
          ctx.strokeStyle = '#1890ff';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          // Calculate bounds
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          el.points.forEach(p => {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
          });
          ctx.strokeRect(minX - 5, minY - 5, (maxX - minX) + 10, (maxY - minY) + 10);
          ctx.restore();
        }

      } else if (el.type === 'circle') {
        if (!el.center || el.radius === undefined) return;

        ctx.beginPath();
        ctx.arc(el.center.x, el.center.y, el.radius, 0, 2 * Math.PI);
        ctx.stroke();

        // Highlight if selected
        if (index === selectedIdx) {
          ctx.save();
          ctx.strokeStyle = '#1890ff';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(el.center.x, el.center.y, el.radius + 5, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.restore();
        }

      } else if (el.type === 'text') {
        if (!el.center || !el.text) return;

        const fSize = el.fontSize || 14;
        ctx.font = `${fSize}px Arial`;
        ctx.fillText(el.text, el.center.x, el.center.y);

        // Highlight if selected
        if (index === selectedIdx) {
          const width = ctx.measureText(el.text).width;
          ctx.save();
          ctx.strokeStyle = '#1890ff';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          // Draw box around text (approximate height)
          ctx.strokeRect(el.center.x - 2, el.center.y - fSize, width + 4, fSize + 4);
          ctx.restore();
        }
      }
    });
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;

    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Helper: check if point hits an element
  const getElementAtPosition = (x, y) => {
    // Iterate reverse to check top-most elements first
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'circle') {
        const dx = x - el.center.x;
        const dy = y - el.center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Allow clicking slightly inside or outside
        if (dist <= el.radius + 10) return i;
      } else if (el.type === 'text') {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const fSize = el.fontSize || 14;
        ctx.font = `${fSize}px Arial`;
        const width = ctx.measureText(el.text).width;

        // Simple bounds check (note: FillText y is baseline)
        if (x >= el.center.x - 5 && x <= el.center.x + width + 5 &&
          y >= el.center.y - fSize - 5 && y <= el.center.y + 5) {
          return i;
        }
      }
      // Freehand hit test (simplified: check bounds)
      else if (el.type === 'freehand') {
        // Checking if point is near any segment
        const threshold = 10;
        // Optimization: check bounding box first
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        el.points.forEach(p => {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        });

        if (x >= minX - threshold && x <= maxX + threshold &&
          y >= minY - threshold && y <= maxY + threshold) {
          // If inside bounding box, do detailed check could be added
          // For now, bounding box is enough
          return i;
        }
      }
    }
    return null;
  };

  const startDrawing = (e) => {
    if (disabled || !canvasInitialized) return;

    const point = getCanvasPoint(e);

    // === SELECT / MOVE TOOL ===
    if (tool === 'select') {
      const clickedIdx = getElementAtPosition(point.x, point.y);

      if (clickedIdx !== null) {
        setSelectedElementIndex(clickedIdx);
        setIsDragging(true);
        setDragStartPos(point);

        // Store original position to calculate delta
        const el = elements[clickedIdx];
        if (el.type === 'circle' || el.type === 'text') {
          setElementStartPos({ ...el.center });
        } else if (el.type === 'freehand') {
          // Determine "center" or just store all points? 
          // Storing updated points on move is easier relative to dragStart
          setElementStartPos(JSON.parse(JSON.stringify(el.points))); // Deep copy points
        }
      } else {
        // Deselect if clicked empty space
        setSelectedElementIndex(null);
      }
      return; // Don't continue to drawing logic
    }

    // === TEXT TOOL ===
    if (tool === 'text') {
      setTextInputPos(point);
      setTextInputVisible(true);
      setTextInputValue(''); // Reset input
      return;
    }

    // === DRAWING TOOLS ===
    e.preventDefault();
    setIsDrawing(true);

    // Reset selection when drawing new things
    setSelectedElementIndex(null);

    if (tool === 'pen') {
      setCurrentElement({
        type: 'freehand',
        points: [point],
        color: color,
        lineWidth: lineWidth
      });
    } else if (tool === 'circle') {
      setCurrentElement({
        type: 'circle',
        center: point,
        radius: 0,
        color: color,
        lineWidth: lineWidth
      });
    }
  };

  const draw = (e) => {
    if (disabled || !canvasInitialized) return;
    const point = getCanvasPoint(e);

    // === DRAGGING LOGIC ===
    if (isDragging && tool === 'select' && selectedElementIndex !== null) {
      e.preventDefault();
      const dx = point.x - dragStartPos.x;
      const dy = point.y - dragStartPos.y;

      const newElements = [...elements];
      const el = { ...newElements[selectedElementIndex] }; // Shallow copy element

      if (el.type === 'circle' || el.type === 'text') {
        el.center = {
          x: elementStartPos.x + dx,
          y: elementStartPos.y + dy
        };
      } else if (el.type === 'freehand') {
        // Shift all points
        el.points = elementStartPos.map(p => ({
          x: p.x + dx,
          y: p.y + dy
        }));
      }

      newElements[selectedElementIndex] = el;
      setElements(newElements);
      return;
    }

    // === DRAWING LOGIC ===
    if (!isDrawing) return;

    e.preventDefault();

    if (tool === 'pen') {
      const newPoints = [...currentElement.points, point];
      const updatedElement = { ...currentElement, points: newPoints };
      setCurrentElement(updatedElement);
      // Visualize
      redrawCanvas([...elements, updatedElement], backgroundImage, null);

    } else if (tool === 'circle') {
      const dx = point.x - currentElement.center.x;
      const dy = point.y - currentElement.center.y;
      const radius = Math.sqrt(dx * dx + dy * dy);

      const updatedElement = { ...currentElement, radius: radius };
      setCurrentElement(updatedElement);

      redrawCanvas([...elements, updatedElement], backgroundImage, null);
    }
  };

  const endDrawing = (e) => {
    // End Dragging
    if (isDragging) {
      setIsDragging(false);
      setElementStartPos(null);
      return;
    }

    // End Drawing
    if (!isDrawing) return;

    e.preventDefault();
    setIsDrawing(false);

    if (currentElement) {
      if (tool === 'pen' && currentElement.points.length > 1) {
        setElements([...elements, currentElement]);
      } else if (tool === 'circle' && currentElement.radius > 0) {
        setElements([...elements, currentElement]);
      }
    }

    setCurrentElement(null);
  };

  const handleTextSubmit = () => {
    if (textInputValue.trim() !== '') {
      setElements([...elements, {
        type: 'text',
        center: textInputPos,
        text: textInputValue,
        color: color,
        fontSize: fontSize
      }]);
    }
    setTextInputVisible(false);
    setTextInputValue('');
  };

  const handleUndo = () => {
    if (elements.length > 0) {
      const newElements = elements.slice(0, -1);
      setElements(newElements);
      setSelectedElementIndex(null);
    }
  };

  const handleClear = () => {
    setElements([]);
    setSelectedElementIndex(null);
  };

  const handleDeleteSelected = () => {
    if (selectedElementIndex !== null) {
      const newElements = elements.filter((_, i) => i !== selectedElementIndex);
      setElements(newElements);
      setSelectedElementIndex(null);
    }
  };

  const handleImageSelect = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const localUrl = e.target.result;
      setImageUrl(localUrl);
      setLocalFile(file);
      setElements([]); // Clear existing annotations
      message.success('Image loaded! Draw your annotations, then submit the form to upload.');
    };

    reader.onerror = () => {
      message.error('Failed to load image');
    };

    reader.readAsDataURL(file);

    return false;
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '12px' }}>
        <Space wrap style={{ marginBottom: 10 }}>
          {!disabled && (
            <Upload
              beforeUpload={handleImageSelect}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} size="small">
                {imageUrl ? 'Change Image' : 'Select Anatomy Image'}
              </Button>
            </Upload>
          )}

          {!disabled && imageUrl && (
            <>
              {/* Tool Selection */}
              <div style={{
                display: 'flex',
                backgroundColor: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <Tooltip title="Select & Move">
                  <button
                    type="button"
                    onClick={() => setTool('select')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: tool === 'select' ? '#e6f7ff' : '#fff',
                      color: tool === 'select' ? '#1890ff' : '#000',
                      border: 'none',
                      borderRight: '1px solid #f0f0f0',
                      cursor: 'pointer'
                    }}
                  >
                    <DragOutlined />
                  </button>
                </Tooltip>
                <Tooltip title="Freehand Pen">
                  <button
                    type="button"
                    onClick={() => setTool('pen')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: tool === 'pen' ? '#e6f7ff' : '#fff',
                      color: tool === 'pen' ? '#1890ff' : '#000',
                      border: 'none',
                      borderRight: '1px solid #f0f0f0',
                      cursor: 'pointer'
                    }}
                  >
                    <HighlightOutlined />
                  </button>
                </Tooltip>
                <Tooltip title="Circle Tool (Drag to size)">
                  <button
                    type="button"
                    onClick={() => setTool('circle')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: tool === 'circle' ? '#e6f7ff' : '#fff',
                      color: tool === 'circle' ? '#1890ff' : '#000',
                      border: 'none',
                      borderRight: '1px solid #f0f0f0',
                      cursor: 'pointer'
                    }}
                  >
                    <DotChartOutlined />
                  </button>
                </Tooltip>
                <Tooltip title="Text Tool (Click to add)">
                  <button
                    type="button"
                    onClick={() => setTool('text')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: tool === 'text' ? '#e6f7ff' : '#fff',
                      color: tool === 'text' ? '#1890ff' : '#000',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <FontSizeOutlined />
                  </button>
                </Tooltip>
              </div>

              {/* Color Selection */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: 8 }}>
                <span style={{ fontSize: '12px', marginRight: '2px' }}>Color:</span>
                {['#FF0000', '#0000FF', '#00FF00', '#FFA500', '#000000'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: c,
                      border: color === c ? '2px solid #fff' : '1px solid #ccc',
                      boxShadow: color === c ? '0 0 0 1px #000' : 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>

              {/* Size Selection */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: 8 }}>
                <span style={{ fontSize: '12px', marginRight: '2px' }}>
                  {tool === 'text' ? 'Font:' : 'Size:'}
                </span>
                {tool === 'text' ? (
                  // Font Size
                  <>
                    <button
                      type="button"
                      onClick={() => setFontSize(14)}
                      style={{
                        padding: '2px 6px',
                        border: fontSize === 14 ? '1px solid #1890ff' : '1px solid #ccc',
                        backgroundColor: fontSize === 14 ? '#e6f7ff' : '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      S
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize(20)}
                      style={{
                        padding: '2px 6px',
                        border: fontSize === 20 ? '1px solid #1890ff' : '1px solid #ccc',
                        backgroundColor: fontSize === 20 ? '#e6f7ff' : '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize(32)}
                      style={{
                        padding: '2px 6px',
                        border: fontSize === 32 ? '1px solid #1890ff' : '1px solid #ccc',
                        backgroundColor: fontSize === 32 ? '#e6f7ff' : '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      L
                    </button>
                  </>
                ) : (
                  // Line Width
                  <>
                    <button
                      type="button"
                      onClick={() => setLineWidth(2)}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: lineWidth === 2 ? '1px solid #1890ff' : '1px solid #ccc',
                        backgroundColor: lineWidth === 2 ? '#e6f7ff' : '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <div style={{ width: '4px', height: '4px', backgroundColor: '#000', borderRadius: '50%' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLineWidth(5)}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: lineWidth === 5 ? '1px solid #1890ff' : '1px solid #ccc',
                        backgroundColor: lineWidth === 5 ? '#e6f7ff' : '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <div style={{ width: '8px', height: '8px', backgroundColor: '#000', borderRadius: '50%' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLineWidth(10)}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: lineWidth === 10 ? '1px solid #1890ff' : '1px solid #ccc',
                        backgroundColor: lineWidth === 10 ? '#e6f7ff' : '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#000', borderRadius: '50%' }} />
                    </button>
                  </>
                )}
              </div>

              {/* Actions */}
              <div style={{ marginLeft: 8, display: 'flex', gap: 4 }}>
                <Tooltip title="Delete Selected">
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteSelected}
                    disabled={selectedElementIndex === null}
                    size="small"
                    danger
                  />
                </Tooltip>

                <Tooltip title="Undo Last">
                  <Button
                    icon={<UndoOutlined />}
                    onClick={handleUndo}
                    disabled={elements.length === 0}
                    size="small"
                  />
                </Tooltip>

                <Tooltip title="Clear All">
                  <Button
                    icon={<ClearOutlined />}
                    onClick={handleClear}
                    disabled={elements.length === 0}
                    size="small"
                    danger
                  />
                </Tooltip>
              </div>
            </>
          )}
        </Space>

        {imageUrl && !disabled && (
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#666',
            backgroundColor: '#f5f5f5',
            padding: '6px 10px',
            borderRadius: '4px'
          }}>
            <strong>Legend:</strong>
            <span style={{ color: '#FF0000', marginLeft: '8px' }}>● Red = Pain</span>
            <span style={{ color: '#0000FF', marginLeft: '8px' }}>● Blue = Treated</span>
            <span style={{ color: '#00FF00', marginLeft: '8px' }}>● Green = Improved</span>
            <span style={{ color: '#FFA500', marginLeft: '8px' }}>● Orange = Mild</span>
            <span style={{ marginLeft: '12px', color: '#1890ff' }}>
              | <b>Tip:</b> Use select tool <DragOutlined /> to move or delete annotations.
            </span>
          </div>
        )}
      </div>

      {imageUrl ? (
        <div style={{
          border: '2px solid #d9d9d9',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#fff',
          display: 'inline-block',
          position: 'relative' // For absolute positioning of text input
        }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
            style={{
              display: 'block',
              cursor: disabled
                ? 'not-allowed'
                : tool === 'select' ? (selectedElementIndex !== null ? 'move' : 'default')
                  : tool === 'text' ? 'text'
                    : 'crosshair',
              touchAction: 'none'
            }}
          />

          {/* Text Input Overlay */}
          <Modal
            title="Add Annotation Text"
            visible={textInputVisible}
            onOk={handleTextSubmit}
            onCancel={() => setTextInputVisible(false)}
            okText="Add"
            width={300}
            zIndex={1050}
            style={{ top: 100 }}
          >
            <Input
              autoFocus
              value={textInputValue}
              onChange={e => setTextInputValue(e.target.value)}
              onPressEnter={handleTextSubmit}
              placeholder="Enter text..."
            />
          </Modal>
        </div>
      ) : (
        <div style={{
          border: '2px dashed #d9d9d9',
          borderRadius: '4px',
          padding: '40px',
          textAlign: 'center',
          color: '#999',
          backgroundColor: '#fafafa'
        }}>
          <UploadOutlined style={{ fontSize: '48px', marginBottom: '12px' }} />
          <div>No anatomy image selected</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Select an anatomy diagram to start marking pain areas
          </div>
        </div>
      )}
    </div>
  );
});

export default BodyAnnotation;