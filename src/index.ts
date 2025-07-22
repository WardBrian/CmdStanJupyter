import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IEditorLanguageRegistry } from '@jupyterlab/codemirror';
import { INotebookTracker } from '@jupyterlab/notebook';
import { Cell, CodeCell } from '@jupyterlab/cells';

import { stanLanguage } from './stan';

function highlightStanCell(cell: Cell | null): void {
  if (cell instanceof CodeCell) {
    const contents = cell.model.sharedModel.getSource();
    if (contents.trim().startsWith('%%stan')) {
      cell.model.mimeType = 'text/x-stan';
    }
  }
}

/**
 * Initialization data for the cmdstanjupyter extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'cmdstanjupyter:plugin',
  description: 'A JupyterLab extension for Stan models.',
  autoStart: true,
  requires: [IEditorLanguageRegistry, INotebookTracker],
  activate: function (
    app: JupyterFrontEnd,
    registry: IEditorLanguageRegistry,
    tracker: INotebookTracker
  ) {
    console.log('JupyterLab extension cmdstanjupyter is activated!');

    registry.addLanguage(stanLanguage);
    app.docRegistry.addFileType({
      name: 'stan',
      contentType: 'code',
      displayName: 'Stan',
      fileFormat: 'text',
      mimeTypes: ['text/x-stan'],
      extensions: ['.stan']
    });

    tracker.currentChanged.connect((tr, nbPanel) => {
      nbPanel?.revealed.then(r => {
        nbPanel.content.widgets.forEach((cell, index, array) => {
          highlightStanCell(cell);
        });
      });
    });

    // highlight %%stan cells on click
    tracker.activeCellChanged.connect(() => {
      highlightStanCell(tracker.activeCell);
    });

    // highlight initally
    tracker.widgetAdded.connect((tr, nbPanel) => {
      nbPanel.revealed.then(r => {
        nbPanel.content.widgets.forEach((cell, index, array) => {
          highlightStanCell(cell);
        });
      });
    });
  }
};

export default plugin;
