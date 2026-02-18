import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button, Space, message, Upload, Tooltip, Input, Modal } from 'antd';
import {
  UndoOutlined,
  ClearOutlined,
  UploadOutlined,
  HighlightOutlined,
  FontSizeOutlined,
  DotChartOutlined,
  DragOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const toolBtnStyle = (isActive) => ({
  padding: '5px 10px',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: isActive ? '#e6f7ff' : '#fff',
  color: isActive ? '#1890ff' : '#595959',
  border: 'none',
  borderRight: '1px solid #f0f0f0',
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
  fontSize: '14px',
  lineHeight: 1,
});

const actionBtnStyle = (isDanger = false, isDisabled = false) => ({
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: isDisabled ? '#f5f5f5' : isDanger ? '#fff1f0' : '#fff',
  color: isDisabled ? '#d9d9d9' : isDanger ? '#ff4d4f' : '#595959',
  border: `1px solid ${isDisabled ? '#d9d9d9' : isDanger ? '#ffa39e' : '#d9d9d9'}`,
  borderRadius: '4px',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  fontSize: '14px',
  lineHeight: 1,
  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  padding: 0,
  flexShrink: 0,
});

const BodyAnnotation = forwardRef(({
  value,
  onChange,
  disabled = false,
  defaultImageUrl = null
}, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(5);
  const [fontSize, setFontSize] = useState(14);

  const [elements, setElements] = useState([]);
  const [currentElement, setCurrentElement] = useState(null);
  const [imageUrl, setImageUrl] = useState(defaultImageUrl);
  const [localFile, setLocalFile] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);

  const [selectedElementIndex, setSelectedElementIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState(null);

  const [textInputVisible, setTextInputVisible] = useState(false);
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
  const [textInputValue, setTextInputValue] = useState('');

  useImperativeHandle(ref, () => ({
    getLocalFile: () => localFile,
    hasLocalFile: () => !!localFile,
    getImageUrl: () => imageUrl,
    clearLocalFile: () => setLocalFile(null),
    setUploadedImageUrl: (url) => {
      setImageUrl(url);
      setLocalFile(null);
    },
    exportAsImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      if (backgroundImage) {
        redrawCanvas(elements, backgroundImage, null);
      }
      return canvas.toDataURL('image/jpeg', 0.9);
    },
    hasAnnotations: () => elements.length > 0
  }));

  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.strokes) {
          const loadedElements = parsed.strokes.map(s => ({
            ...s,
            type: s.type || 'freehand'
          }));
          setElements(loadedElements);
        }
        const url = parsed.imageUrl || parsed;
        if (url) setImageUrl(url);
      } catch (e) {
        setImageUrl(value);
      }
    }
  }, [value]);

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
    if (bgImage) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    elementsToDraw.forEach((el, index) => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.lineWidth || 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'freehand') {
        if (!el.points || el.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) ctx.lineTo(el.points[i].x, el.points[i].y);
        ctx.stroke();
        if (index === selectedIdx) {
          ctx.save();
          ctx.strokeStyle = '#1890ff';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          el.points.forEach(p => {
            minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
          });
          ctx.strokeRect(minX - 5, minY - 5, (maxX - minX) + 10, (maxY - minY) + 10);
          ctx.restore();
        }
      } else if (el.type === 'circle') {
        if (!el.center || el.radius === undefined) return;
        ctx.beginPath();
        ctx.arc(el.center.x, el.center.y, el.radius, 0, 2 * Math.PI);
        ctx.stroke();
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
        if (index === selectedIdx) {
          const width = ctx.measureText(el.text).width;
          ctx.save();
          ctx.strokeStyle = '#1890ff';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
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
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const getElementAtPosition = (x, y) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'circle') {
        const dx = x - el.center.x;
        const dy = y - el.center.y;
        if (Math.sqrt(dx * dx + dy * dy) <= el.radius + 10) return i;
      } else if (el.type === 'text') {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const fSize = el.fontSize || 14;
        ctx.font = `${fSize}px Arial`;
        const width = ctx.measureText(el.text).width;
        if (x >= el.center.x - 5 && x <= el.center.x + width + 5 &&
          y >= el.center.y - fSize - 5 && y <= el.center.y + 5) return i;
      } else if (el.type === 'freehand') {
        const threshold = 10;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        el.points.forEach(p => {
          minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
        });
        if (x >= minX - threshold && x <= maxX + threshold &&
          y >= minY - threshold && y <= maxY + threshold) return i;
      }
    }
    return null;
  };

  const startDrawing = (e) => {
    if (disabled || !canvasInitialized) return;
    const point = getCanvasPoint(e);
    if (tool === 'select') {
      const clickedIdx = getElementAtPosition(point.x, point.y);
      if (clickedIdx !== null) {
        setSelectedElementIndex(clickedIdx);
        setIsDragging(true);
        setDragStartPos(point);
        const el = elements[clickedIdx];
        if (el.type === 'circle' || el.type === 'text') {
          setElementStartPos({ ...el.center });
        } else if (el.type === 'freehand') {
          setElementStartPos(JSON.parse(JSON.stringify(el.points)));
        }
      } else {
        setSelectedElementIndex(null);
      }
      return;
    }
    if (tool === 'text') {
      setTextInputPos(point);
      setTextInputVisible(true);
      setTextInputValue('');
      return;
    }
    e.preventDefault();
    setIsDrawing(true);
    setSelectedElementIndex(null);
    if (tool === 'pen') {
      setCurrentElement({ type: 'freehand', points: [point], color, lineWidth });
    } else if (tool === 'circle') {
      setCurrentElement({ type: 'circle', center: point, radius: 0, color, lineWidth });
    }
  };

  const draw = (e) => {
    if (disabled || !canvasInitialized) return;
    const point = getCanvasPoint(e);
    if (isDragging && tool === 'select' && selectedElementIndex !== null) {
      e.preventDefault();
      const dx = point.x - dragStartPos.x;
      const dy = point.y - dragStartPos.y;
      const newElements = [...elements];
      const el = { ...newElements[selectedElementIndex] };
      if (el.type === 'circle' || el.type === 'text') {
        el.center = { x: elementStartPos.x + dx, y: elementStartPos.y + dy };
      } else if (el.type === 'freehand') {
        el.points = elementStartPos.map(p => ({ x: p.x + dx, y: p.y + dy }));
      }
      newElements[selectedElementIndex] = el;
      setElements(newElements);
      return;
    }
    if (!isDrawing) return;
    e.preventDefault();
    if (tool === 'pen') {
      const newPoints = [...currentElement.points, point];
      const updatedElement = { ...currentElement, points: newPoints };
      setCurrentElement(updatedElement);
      redrawCanvas([...elements, updatedElement], backgroundImage, null);
    } else if (tool === 'circle') {
      const dx = point.x - currentElement.center.x;
      const dy = point.y - currentElement.center.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const updatedElement = { ...currentElement, radius };
      setCurrentElement(updatedElement);
      redrawCanvas([...elements, updatedElement], backgroundImage, null);
    }
  };

  const endDrawing = (e) => {
    if (isDragging) {
      setIsDragging(false);
      setElementStartPos(null);
      return;
    }
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    if (currentElement) {
      if (tool === 'pen' && currentElement.points.length > 1) setElements([...elements, currentElement]);
      else if (tool === 'circle' && currentElement.radius > 0) setElements([...elements, currentElement]);
    }
    setCurrentElement(null);
  };

  const handleTextSubmit = () => {
    if (textInputValue.trim() !== '') {
      setElements([...elements, {
        type: 'text',
        center: textInputPos,
        text: textInputValue,
        color,
        fontSize
      }]);
    }
    setTextInputVisible(false);
    setTextInputValue('');
  };

  const handleUndo = () => {
    if (elements.length > 0) {
      setElements(elements.slice(0, -1));
      setSelectedElementIndex(null);
    }
  };

  const handleClear = () => {
    setElements([]);
    setSelectedElementIndex(null);
  };

  const handleDeleteSelected = () => {
    if (selectedElementIndex !== null) {
      setElements(elements.filter((_, i) => i !== selectedElementIndex));
      setSelectedElementIndex(null);
    }
  };

  const handleImageSelect = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target.result);
      setLocalFile(file);
      setElements([]);
      message.success('Image loaded! Draw your annotations, then submit the form to upload.');
    };
    reader.onerror = () => message.error('Failed to load image');
    reader.readAsDataURL(file);
    return false;
  };

  const isDeleteDisabled = selectedElementIndex === null;
  const isUndoDisabled = elements.length === 0;
  const isClearDisabled = elements.length === 0;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '12px' }}>
        <Space wrap style={{ marginBottom: 10 }}>
          {!disabled && (
            <Upload beforeUpload={handleImageSelect} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} size="small">
                {imageUrl ? 'Change Image' : 'Select Anatomy Image'}
              </Button>
            </Upload>
          )}

          {!disabled && imageUrl && (
            <>
              {/* Tool Group */}
              <div style={{
                display: 'flex',
                backgroundColor: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                overflow: 'hidden',
                height: '32px',
              }}>
                {[
                  { key: 'select', icon: <DragOutlined />, title: 'Select & Move' },
                  { key: 'pen', icon: <HighlightOutlined />, title: 'Freehand Pen' },
                  { key: 'circle', icon: <DotChartOutlined />, title: 'Circle Tool (Drag to size)' },
                  { key: 'text', icon: <FontSizeOutlined />, title: 'Text Tool (Click to add)' },
                ].map((t, idx, arr) => (
                  <Tooltip key={t.key} title={t.title}>
                    <button
                      type="button"
                      onClick={() => setTool(t.key)}
                      style={{
                        ...toolBtnStyle(tool === t.key),
                        borderRight: idx < arr.length - 1 ? '1px solid #f0f0f0' : 'none',
                      }}
                    >
                      {t.icon}
                    </button>
                  </Tooltip>
                ))}
              </div>

              {/* Color Selection */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#595959' }}>Color:</span>
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
                      boxShadow: color === c ? '0 0 0 2px #1890ff' : 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>

              {/* Size Selection */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#595959' }}>
                  {tool === 'text' ? 'Font:' : 'Size:'}
                </span>
                {tool === 'text' ? (
                  ['S', 'M', 'L'].map((label, i) => {
                    const sizes = [14, 20, 32];
                    const sz = sizes[i];
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setFontSize(sz)}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: fontSize === sz ? '1px solid #1890ff' : '1px solid #d9d9d9',
                          backgroundColor: fontSize === sz ? '#e6f7ff' : '#fff',
                          color: fontSize === sz ? '#1890ff' : '#595959',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })
                ) : (
                  [2, 5, 10].map((w) => {
                    const dotSize = w === 2 ? 4 : w === 5 ? 8 : 12;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setLineWidth(w)}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: lineWidth === w ? '1px solid #1890ff' : '1px solid #d9d9d9',
                          backgroundColor: lineWidth === w ? '#e6f7ff' : '#fff',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{ width: dotSize, height: dotSize, backgroundColor: lineWidth === w ? '#1890ff' : '#595959', borderRadius: '50%' }} />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Action Buttons — consistent with toolbar height */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <Tooltip title="Delete Selected">
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={isDeleteDisabled}
                    style={actionBtnStyle(true, isDeleteDisabled)}
                  >
                    <DeleteOutlined />
                  </button>
                </Tooltip>
                <Tooltip title="Undo Last">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={isUndoDisabled}
                    style={actionBtnStyle(false, isUndoDisabled)}
                  >
                    <UndoOutlined />
                  </button>
                </Tooltip>
                <Tooltip title="Clear All">
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={isClearDisabled}
                    style={actionBtnStyle(true, isClearDisabled)}
                  >
                    <ClearOutlined />
                  </button>
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
          position: 'relative'
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