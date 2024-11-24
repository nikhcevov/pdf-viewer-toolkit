import { EditorPlugin } from '../../../model/EditorPlugin';
import { MeasurementsPluginTools } from '../config/types';
import { getMousePosition } from '../lib/getMousePosition';

import type { PluginProps } from '../../../model/Plugin';

export class MeasurementsPlugin extends EditorPlugin {
  private activeTool: MeasurementsPluginTools | null = null;

  constructor({ viewer }: PluginProps) {
    super({ viewer });
    this.activeTool = null;
  }

  public load(): void {
    super.load();
  }

  public unload(): void {
    super.unload();
  }

  // TODO: Add other tools, change active tool properly
  toggleTool = (tool: MeasurementsPluginTools) => {
    if (tool === MeasurementsPluginTools.COUNTER) {
      this.toggleCounterTool();
      return;
    }
  };

  toggleCounterTool = () => {
    const isCounterToolActive = this.activeTool === MeasurementsPluginTools.COUNTER;

    if (isCounterToolActive) {
      this._toggleEditor();
      this.activeTool = null;
      return;
    }

    this.activeTool = MeasurementsPluginTools.COUNTER;
    this._toggleEditor();
    this._pages.forEach((page) => {
      this._getPageEditorCanvas(page).style.cursor = 'crosshair';

      this._getPageEditorCanvas(page).addEventListener('click', (event) => {
        const canvas = this._getPageEditorCanvas(page);
        const context = canvas.getContext('2d');

        if (!context) {
          return;
        }

        const { x, y } = getMousePosition(canvas, event);

        // Draw check mark
        context.beginPath();
        context.moveTo(x - 10, y);
        context.lineTo(x - 5, y + 5);
        context.lineTo(x + 10, y - 10);
        context.lineWidth = 5;
        context.strokeStyle = 'green';
        context.stroke();

      });
    });
  };
}
