/**
 * White Caves Real Estate - Interactive Drag & Keyboard Micro-Nudge Controller (pdf_drag_controller.js)
 * Single-responsibility module for dragging field markers on Page 1 & Page 3 and 1pt arrow-key nudging.
 */

window.PdfDragController = {
    bindNodeMouseDown: function (viewer, element) {
        element.addEventListener("mousedown", function (e) {
            viewer.activeDragElement = element;
            viewer.selectNode(element);

            viewer.dragStartMouse.x = e.clientX;
            viewer.dragStartMouse.y = e.clientY;
            viewer.dragStartPos.left = parseFloat(element.style.left) || 0;
            viewer.dragStartPos.top = parseFloat(element.style.top) || 0;

            element.classList.add("dragging-active");
            e.preventDefault();
            e.stopPropagation();
        });
    },

    bindGlobalEventsOnce: function (viewer) {
        if (viewer._listenersBound || typeof document === "undefined") return;
        viewer._listenersBound = true;

        document.addEventListener("mousemove", function (e) {
            if (!viewer.activeDragElement) return;
            const dx = (e.clientX - viewer.dragStartMouse.x) / viewer.currentZoom;
            const dy = (e.clientY - viewer.dragStartMouse.y) / viewer.currentZoom;

            let computedLeft = viewer.dragStartPos.left + dx;
            let computedTop = viewer.dragStartPos.top + dy;

            const maxW = 595 - Math.min(viewer.activeDragElement.offsetWidth, 120);
            const maxH = 842 - viewer.activeDragElement.offsetHeight;

            computedLeft = Math.max(-viewer.PAD_LEFT, Math.min(computedLeft, maxW));
            computedTop = Math.max(0, Math.min(computedTop, maxH));

            viewer.activeDragElement.style.left = `${computedLeft}px`;
            viewer.activeDragElement.style.top = `${computedTop}px`;
            viewer.saveUpdatedNodeCoordinates(viewer.activeDragElement, false);
        });

        document.addEventListener("mouseup", function () {
            if (viewer.activeDragElement) {
                viewer.activeDragElement.classList.remove("dragging-active");
                viewer.saveUpdatedNodeCoordinates(viewer.activeDragElement, true);
                viewer.activeDragElement = null;
            }
        });

        document.addEventListener("keydown", function (e) {
            if (!viewer.selectedElement) return;
            const activeTag = document.activeElement ? document.activeElement.tagName : "";
            if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

            const step = e.shiftKey ? 5 : 1;
            let left = parseFloat(viewer.selectedElement.style.left) || 0;
            let top = parseFloat(viewer.selectedElement.style.top) || 0;
            let handled = false;

            if (e.key === "ArrowLeft") { left -= step; handled = true; }
            else if (e.key === "ArrowRight") { left += step; handled = true; }
            else if (e.key === "ArrowUp") { top -= step; handled = true; }
            else if (e.key === "ArrowDown") { top += step; handled = true; }

            if (handled) {
                e.preventDefault();
                viewer.selectedElement.style.left = `${left}px`;
                viewer.selectedElement.style.top = `${top}px`;
                viewer.saveUpdatedNodeCoordinates(viewer.selectedElement, true);
            }
        });
    }
};
