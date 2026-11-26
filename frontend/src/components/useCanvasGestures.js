// Sahibi: 2. kişi (Not İşlemleri)
// Ana sayfa tuvalindeki imleç hareketleri: boş yerden tutup tuvali kaydırma ve
// bir öğeyi (not kartı ya da etiket destesi) sürükleme.

import { useEffect, useRef, useState } from 'react';
import {
  CANVAS_PADDING,
  CANVAS_POSITION_MAX,
  clamp,
  edgeScrollStep,
  overflowBeyond,
} from './canvasLayout.js';

// İmleç bu kadar piksel kaymadan sürükleme başlamaz (tıklama titremesi öğeyi oynatmasın).
const DRAG_THRESHOLD = 4;

// viewportRef : tuvalin kayan kapsayıcısı (.note-canvas)
// onGrowArea(neededWidth, neededHeight) : kenardan kaydırırken alan yetmezse çağrılır
// Döndürür: { isGrabbing, startPan(event), startDrag(event, options) }
export function useCanvasGestures(viewportRef, onGrowArea) {
  const stopGestureRef = useRef(null);
  const [isGrabbing, setIsGrabbing] = useState(false);

  // Sayfadan çıkılırsa yarım kalan hareketin dinleyicilerini kaldır.
  useEffect(() => () => stopGestureRef.current?.(), []);

  // İmleç bırakılana kadar pencere genelinde hareketi izler (imleç tuvalden çıksa da).
  function trackPointer(onPointerMove, onPointerEnd) {
    function handleEnd(event) {
      stop();
      onPointerEnd(event);
    }
    function stop() {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
      stopGestureRef.current = null;
    }
    stopGestureRef.current?.();
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    stopGestureRef.current = stop;
  }

  // Tuvali imleçle birlikte kaydırır (tuvalin boş yerine basılınca çağrılır).
  function startPan(event) {
    const viewport = viewportRef.current;
    const start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
    setIsGrabbing(true);
    trackPointer(
      (moveEvent) => {
        viewport.scrollLeft = start.left - (moveEvent.clientX - start.pointerX);
        viewport.scrollTop = start.top - (moveEvent.clientY - start.pointerY);
      },
      () => setIsGrabbing(false),
    );
  }

  // Bir öğeyi sürükler. Öğe tuvalin görünen kısmında kalır; kenara dayandıkça
  // tuval o yöne kayar. event.currentTarget sürüklenen öğe olmalıdır.
  // options:
  //   x, y             : öğenin Framer Motion konum değerleri (useMotionValue)
  //   onStart()        : sürükleme başlayınca (eşik aşılınca)
  //   onEnd()          : sürükleme bitince (bırakma ya da iptal)
  //   onDrop(x, y)     : bırakılınca, yuvarlanmış yeni konumla
  //   onClick()        : imleç kaydırılmadan bırakılınca (isteğe bağlı)
  function startDrag(event, { x, y, onStart, onEnd, onDrop, onClick }) {
    const viewport = viewportRef.current;
    const width = event.currentTarget.offsetWidth;
    const height = event.currentTarget.offsetHeight;
    const start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
      x: x.get(),
      y: y.get(),
    };
    let pointer = { x: event.clientX, y: event.clientY };
    let isDragging = false;
    let frame = 0;

    // Öğeyi imlecin gösterdiği yere koyar (görünen alana sığdırarak); ne kadar
    // taşmak istediğini döndürür.
    function placeItem() {
      const rawX = start.x + pointer.x - start.pointerX + viewport.scrollLeft - start.left;
      const rawY = start.y + pointer.y - start.pointerY + viewport.scrollTop - start.top;
      const minX = viewport.scrollLeft;
      const minY = viewport.scrollTop;
      const maxX = Math.max(minX, minX + viewport.clientWidth - width - 2 * CANVAS_PADDING);
      const maxY = Math.max(minY, minY + viewport.clientHeight - height - 2 * CANVAS_PADDING);
      x.set(clamp(rawX, minX, Math.min(maxX, CANVAS_POSITION_MAX)));
      y.set(clamp(rawY, minY, Math.min(maxY, CANVAS_POSITION_MAX)));
      return { overflowX: overflowBeyond(rawX, minX, maxX), overflowY: overflowBeyond(rawY, minY, maxY) };
    }

    // Her karede: öğe kenara dayanıyorsa tuvali o yöne kaydır, öğeyi imlece yetiştir.
    function autoScroll() {
      const { overflowX, overflowY } = placeItem();
      const stepX = edgeScrollStep(overflowX);
      const stepY = edgeScrollStep(overflowY);
      if (stepX || stepY) {
        onGrowArea(
          viewport.scrollLeft + viewport.clientWidth + Math.max(0, stepX),
          viewport.scrollTop + viewport.clientHeight + Math.max(0, stepY),
        );
        viewport.scrollLeft += stepX;
        viewport.scrollTop += stepY;
        placeItem();
      }
      frame = requestAnimationFrame(autoScroll);
    }

    trackPointer(
      (moveEvent) => {
        pointer = { x: moveEvent.clientX, y: moveEvent.clientY };
        if (!isDragging) {
          const distance = Math.hypot(pointer.x - start.pointerX, pointer.y - start.pointerY);
          if (distance < DRAG_THRESHOLD) return;
          isDragging = true;
          setIsGrabbing(true);
          onStart?.();
          frame = requestAnimationFrame(autoScroll);
        }
        placeItem();
      },
      (endEvent) => {
        cancelAnimationFrame(frame);
        if (!isDragging) {
          if (endEvent.type === 'pointerup') onClick?.();
          return;
        }
        setIsGrabbing(false);
        onEnd?.();
        if (endEvent.type === 'pointercancel') {
          x.set(start.x);
          y.set(start.y);
          return;
        }
        onDrop(Math.round(x.get()), Math.round(y.get()));
      },
    );
  }

  return { isGrabbing, startPan, startDrag };
}
