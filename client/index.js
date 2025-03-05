import QueryManager from './TopLevelProc-copy.js';
import { createStore } from 'https://cdnjs.cloudflare.com/ajax/libs/redux/5.0.1/redux.legacy-esm.js';

import Toolbox from './panels/toolbox.js';
import Canvas from './panels/canvas.js';
import RightPanel from './panels/rightPanel.js';
import pubSub from './pubSub.js';
import { getEditorPageInfo, saveEditorPage } from './services/editorService.js';
import { generateExportedPage } from './services/exportService.js';

const popup = document.getElementById('popupContainer');
const popupClose = document.getElementById('popupClose');
const popupLoad = document.getElementById('popupLoad');
const popupInput = document.getElementById('imageUrlInput');

let predicates = [];
let inputCodeValue = '';

const initialState = {
  predicateQueriesInserted: [],
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_PREDICATE_QUERY':
      return {
        ...state,
        predicateQueriesInserted: [...state.predicateQueriesInserted, action.payload],
      };
    case 'REMOVE_PREDICATE_QUERY':
      return {
        ...state,
        predicateQueriesInserted: state.predicateQueriesInserted.filter(
          (id) => id !== action.payload
        ),
      };
    case 'SETUP_WIDGETS_INDEX_COUNT':
      return {
        ...state,
        widgetsIndexCount: (action.payload).map((elem) => ({
          predicate: elem.name,
          index: 0,
        }))
      };
    case 'INCREMENT_WIDGET_INDEX':
      return {
        ...state,
        widgetsIndexCount: state.widgetsIndexCount.map((widget) =>
          widget.predicate === action.payload
            ? { ...widget, index: widget.index + 1 }
            : widget
        ),
      };
    default:
      return state;
  }
};

const editorPageInfo = (await getEditorPageInfo(window.location.pathname.split('/edit/')[1]))
const preloadedState = editorPageInfo?.globalState
console.log(preloadedState)
const store = createStore(rootReducer, preloadedState);

let queryManager = new QueryManager();

(async () => {
  await queryManager.start_ciao_worker();

  pubSub.subscribe('uploadCode', handleUploadCode);
  pubSub.subscribe('saveEditPage', handleSaveEditPage);
  pubSub.subscribe('export', handleExportProject);
  // pubSub.subscribe('newQueryWidgetId', (data) => predicateQueriesInserted.push(data.detail.widgetId));
  pubSub.subscribe('runQuery', async (data) => handleRunQuery(data.detail.query));

  const canvas = new Canvas(store);
  canvas.setup();

  const rightPanel = new RightPanel();
  await rightPanel.setup();

  const toolbox = new Toolbox();
  toolbox.setup();

  store.subscribe(() => {
    console.log('Updated Global State:', store.getState());
  });
})();

async function handleRunQuery(query) {
  try {
    const result = await queryManager.run_query_all_results(query, '');
    pubSub.publish('showResults', { detail: { result } });
  } catch (error) {
    console.error('Error running query:', error);
  }
}

async function handleUploadCode(data) {
  predicates = data.detail.predicates;
  inputCodeValue = data.detail.inputCodeValue;

  if (!preloadedState) store.dispatch({ type: 'SETUP_WIDGETS_INDEX_COUNT', payload: predicates })

  await queryManager.upload_code_to_worker(inputCodeValue);
  await queryManager.run_query("use_module('/draft.pl')", '');

  pubSub.publish('codeInput', { detail: { predicates } });
}

function handleSaveEditPage() {
  const dynamicHTML = document.documentElement.outerHTML;
  const editRoute = window.location.pathname.split('/edit/')[1];
  console.log((store.getState()).predicateQueriesInserted)
  const queryWidgetsIdList = (store.getState()).predicateQueriesInserted;

  saveEditorPage(editRoute, dynamicHTML, store.getState())
    .then(message => {
      alert('Proyecto guardado con éxito!');
    })
    .catch(error => console.error('Error:', error));
}

function handleExportProject() {
  const dynamicHTML = createTemplate(pageContainer.innerHTML)
  const editRoute = window.location.pathname.split('/edit/')[1];

  generateExportedPage(editRoute, dynamicHTML, inputCodeValue, predicates, (store.getState()).predicateQueriesInserted)
    .then(message => window.open('/export/' + message, '_blank'))
    .catch(error => console.error('Error:', error));
}

popupClose.addEventListener('click', () => {
  deactivatePopup();
})

function handlePopupInput(callback) {
  var callbackAndDeactivatePopup = function () {
    callback(popupInput.value);
    deactivatePopup();
    popupLoad.removeEventListener('click', callbackAndDeactivatePopup);
  }
  popupLoad.addEventListener('click', callbackAndDeactivatePopup);
}

function activatePopup() {
  popupInput.value = '';
  popup.style.display = 'block';
}

function deactivatePopup() {
  popup.style.display = 'none';
}


function createTemplate(dynamicHTML) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script></script>
    <title>Prolog Web App Creator</title>

    <link rel="stylesheet" href="/dist/styles.css">
    <link rel="stylesheet" href="/client/css/indexExportMode.css">
    <!--<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">-->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body>
<div class="">
    <!-- Header -->
    <html data-theme="acid"></html>


    <div class="flex justify-between">

        <!-- Canvas -->
        <div class="pageContainer relative flex-grow border-2 border-black bg-base-100" id="pageContainer">
          ${dynamicHTML}
            <!--<div class="middle-circle"></div>
            <button id="resizeButton">↓</button> -->
        </div>

        <!-- Right Panel -->
        <div class="basis-1/5 border-2 border-black p-4 bg-secondary" id="codeContainer">

            <!-- Results -->
            <div class="m-2 h-[15%]">
                <h3 class="text-xl font-bold">Resultados</h3>
                <textarea readonly disabled id="results" class="resultsText rounded-xl font-bold border-2 border-black h-[100%] w-[100%] p-4"></textarea>
            </div>
        </div>
    </div>
    <script type="module" src="/client/exportedPage.js"></script>
</div>

</body>
</html>
  `;
}