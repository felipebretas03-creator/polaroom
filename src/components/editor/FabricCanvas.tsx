"use client"

import React, { useEffect, useRef } from "react"
import { fabric } from "fabric"

interface PolaroidTemplate {
  frameUrl: string
  width: number
  height: number
  photoArea: {
    x: number
    y: number
    width: number
    height: number
  }
  textArea: {
    x: number
    y: number
    width: number
  }
}

interface FabricCanvasProps {
  imageUrl: string | null
  text: string
  fontFamily: string
  textColor: string
  template: PolaroidTemplate
  cropData?: { left: number, top: number, scaleX: number, scaleY: number } | null
  onCropChange?: (data: { left: number, top: number, scaleX: number, scaleY: number }) => void
  fontSize?: number
}

export default function FabricCanvas({
  imageUrl,
  text,
  fontFamily,
  textColor,
  template,
  cropData,
  onCropChange,
  fontSize = 24,
}: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    let isDisposed = false;

    // Initialize Canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: template.width,
      height: template.height,
      selection: false,
      backgroundColor: "transparent",
    })

    let textObj: fabric.Textbox | null = null;
    let frameObj: fabric.Image | null = null;
    let photoObj: fabric.Image | null = null;

    const arrangeLayers = () => {
      if (isDisposed) return;
      if (photoObj) canvas.sendToBack(photoObj);
      if (frameObj) {
        canvas.add(frameObj);
        if (photoObj) canvas.bringForward(frameObj);
      }
      if (textObj) canvas.bringToFront(textObj);
      canvas.renderAll();
    }

    // 1. Draw the Text
    if (text) {
      textObj = new fabric.Textbox(text, {
        left: template.textArea.x,
        top: template.textArea.y,
        width: template.textArea.width,
        fontFamily: fontFamily === "sans" ? "var(--font-poppins)" : fontFamily === "serif" ? "var(--font-playfair)" : fontFamily,
        fontSize: fontSize,
        fill: textColor,
        textAlign: "center",
        selectable: false,
        lockScalingX: true,
        lockScalingY: true,
        originX: "left",
        backgroundColor: "rgba(255, 255, 255, 0.85)", // White background with slight transparency
      })
      canvas.add(textObj)
    }

    // 2. Load Frame Image
    fabric.Image.fromURL(template.frameUrl, (img) => {
      if (!canvas || isDisposed) return;
      img.set({
        left: 0,
        top: 0,
        scaleX: template.width / (img.width || 1),
        scaleY: template.height / (img.height || 1),
        selectable: false,
        evented: false,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.2)',
          blur: 15,
          offsetX: 0,
          offsetY: 5
        })
      });
      frameObj = img;
      canvas.add(img);
      arrangeLayers();
    }, { crossOrigin: 'anonymous' });

    // 3. Load Photo Image
    if (imageUrl) {
      fabric.Image.fromURL(imageUrl, (img) => {
        if (!canvas || isDisposed) return;
        
        let defaultScale = Math.max(
          template.photoArea.width / (img.width || 1),
          template.photoArea.height / (img.height || 1)
        )
        
        let left = cropData?.left ?? template.photoArea.x;
        let top = cropData?.top ?? template.photoArea.y;
        let scaleX = cropData?.scaleX ?? defaultScale;
        let scaleY = cropData?.scaleY ?? defaultScale;

        // Center by default if no cropData
        if (!cropData) {
           left = template.photoArea.x + (template.photoArea.width - (img.width || 1) * defaultScale) / 2;
           top = template.photoArea.y + (template.photoArea.height - (img.height || 1) * defaultScale) / 2;
        }
        
        img.set({
          left,
          top,
          scaleX,
          scaleY,
          selectable: true,
          hasControls: true,
          evented: true,
          hasBorders: true,
          transparentCorners: false,
          cornerColor: '#000',
          cornerSize: 10,
          lockRotation: true,
          lockSkewingX: true,
          lockSkewingY: true,
          clipPath: new fabric.Rect({
            left: template.photoArea.x,
            top: template.photoArea.y,
            width: template.photoArea.width,
            height: template.photoArea.height,
            absolutePositioned: true
          })
        })

        img.on('modified', () => {
           if (onCropChange) {
              onCropChange({
                 left: img.left || 0,
                 top: img.top || 0,
                 scaleX: img.scaleX || 1,
                 scaleY: img.scaleY || 1
              })
           }
        })

        photoObj = img;
        canvas.add(img);
        arrangeLayers();
        
      }, { crossOrigin: 'anonymous' })
    } else {
      // Placeholder photo rect
      const placeholder = new fabric.Rect({
        left: template.photoArea.x,
        top: template.photoArea.y,
        width: template.photoArea.width,
        height: template.photoArea.height,
        fill: "#e4e4e7", // zinc-200
        selectable: false,
      })
      canvas.add(placeholder)
      canvas.sendToBack(placeholder)
      arrangeLayers();
    }

    return () => {
      isDisposed = true;
      canvas.dispose()
    }
  }, [imageUrl, text, fontFamily, textColor, template, cropData])

  return (
    <div className="relative flex items-center justify-center">
      <div className="transform-gpu scale-[0.6] sm:scale-[0.8] lg:scale-[0.7] xl:scale-[0.8] origin-center transition-transform">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
