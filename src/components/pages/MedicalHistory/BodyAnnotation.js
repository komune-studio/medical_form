import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button, Space, message, Upload } from 'antd';
import { 
  UndoOutlined, 
  ClearOutlined,
  UploadOutlined
} from '@ant-design/icons';

const BodyAnnotation = forwardRef(({ 
  value, 
  onChange, 
  disabled = false,
  defaultImageUrl = null
}, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(5);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [imageUrl, setImageUrl] = useState(defaultImageUrl);
  const [localFile, setLocalFile] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);

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
      
      return canvas.toDataURL('image/jpeg', 0.9);
    },
    // Buat cek apakah ada annotation
    hasAnnotations: () => strokes.length > 0
  }));

  // Parse incoming value from database
  useEffect(() => {
    if (value) {
      try {
        // Coba parse dulu, mungkin JSON
        const parsed = JSON.parse(value);
        
        if (parsed.strokes) {
          setStrokes(parsed.strokes);
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
        
        redrawCanvas(strokes, img);
        setCanvasInitialized(true);
      };
      
      img.onerror = (e) => {
        console.error('Failed to load image:', e);
        message.error('Failed to load image');
      };
      
      img.src = imageUrl;
    }
  }, [imageUrl]);

  // Redraw canvas when strokes change
  useEffect(() => {
    if (canvasInitialized && backgroundImage) {
      redrawCanvas(strokes, backgroundImage);
    }
  }, [strokes, canvasInitialized, backgroundImage]);

  const redrawCanvas = (strokesToDraw, bgImage) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }

    strokesToDraw.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.stroke();
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

  const startDrawing = (e) => {
    if (disabled || !canvasInitialized) return;
    
    e.preventDefault();
    setIsDrawing(true);
    
    const point = getCanvasPoint(e);
    setCurrentStroke([point]);
  };

  const draw = (e) => {
    if (!isDrawing || disabled || !canvasInitialized) return;
    
    e.preventDefault();
    
    const point = getCanvasPoint(e);
    const newStroke = [...currentStroke, point];
    setCurrentStroke(newStroke);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (currentStroke.length > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(currentStroke[currentStroke.length - 1].x, currentStroke[currentStroke.length - 1].y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const endDrawing = (e) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    setIsDrawing(false);
    
    if (currentStroke.length > 1) {
      const newStrokes = [...strokes, {
        points: currentStroke,
        color: color,
        lineWidth: lineWidth
      }];
      setStrokes(newStrokes);
    }
    
    setCurrentStroke([]);
  };

  const handleUndo = () => {
    if (strokes.length > 0) {
      const newStrokes = strokes.slice(0, -1);
      setStrokes(newStrokes);
    }
  };

  const handleClear = () => {
    setStrokes([]);
  };

  const handleImageSelect = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const localUrl = e.target.result;
      setImageUrl(localUrl);
      setLocalFile(file);
      setStrokes([]); // Clear existing annotations
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
        <Space wrap>
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
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', marginRight: '4px' }}>Color:</span>
                <button
                  onClick={() => setColor('#FF0000')}
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#FF0000',
                    border: color === '#FF0000' ? '3px solid #000' : '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Red (Pain)"
                />
                <button
                  onClick={() => setColor('#0000FF')}
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#0000FF',
                    border: color === '#0000FF' ? '3px solid #000' : '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Blue (Treated)"
                />
                <button
                  onClick={() => setColor('#00FF00')}
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#00FF00',
                    border: color === '#00FF00' ? '3px solid #000' : '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Green (Improved)"
                />
                <button
                  onClick={() => setColor('#FFA500')}
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#FFA500',
                    border: color === '#FFA500' ? '3px solid #000' : '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Orange (Mild)"
                />
                <button
                  onClick={() => setColor('#000000')}
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#000000',
                    border: color === '#000000' ? '3px solid #666' : '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Black"
                />
              </div>

              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', marginRight: '4px' }}>Size:</span>
                <button
                  onClick={() => setLineWidth(2)}
                  style={{
                    width: '28px',
                    height: '28px',
                    border: lineWidth === 2 ? '2px solid #000' : '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    backgroundColor: '#fff'
                  }}
                >
                  S
                </button>
                <button
                  onClick={() => setLineWidth(5)}
                  style={{
                    width: '28px',
                    height: '28px',
                    border: lineWidth === 5 ? '2px solid #000' : '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    backgroundColor: '#fff'
                  }}
                >
                  M
                </button>
                <button
                  onClick={() => setLineWidth(8)}
                  style={{
                    width: '28px',
                    height: '28px',
                    border: lineWidth === 8 ? '2px solid #000' : '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    backgroundColor: '#fff'
                  }}
                >
                  L
                </button>
              </div>

              <Button
                icon={<UndoOutlined />}
                onClick={handleUndo}
                disabled={strokes.length === 0}
                size="small"
              >
                Undo
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClear}
                disabled={strokes.length === 0}
                size="small"
                danger
              >
                Clear All
              </Button>
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
            {localFile && (
              <span style={{ marginLeft: '12px', fontStyle: 'italic', color: '#ff6600' }}>
                ⚠ Image will be uploaded when you submit the form
              </span>
            )}
          </div>
        )}
      </div>

      {imageUrl ? (
        <div style={{ 
          border: '2px solid #d9d9d9', 
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#fff',
          display: 'inline-block'
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
              cursor: disabled ? 'not-allowed' : 'crosshair',
              touchAction: 'none'
            }}
          />
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