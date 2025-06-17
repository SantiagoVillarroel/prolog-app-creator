//import QueryManager from './TopLevelProc-copy.js';
import * as helpers from '../helpers.js';
import pubSub from '../pubSub.js';

const upperCaseLetters = ['X', 'Y', 'Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];

export default class Canvas {
    constructor(store) {
        this.pageContainer = document.getElementById('pageContainer');
        this.predicateQueriesInserted = [];
        this.predicateQueriesIndexes = {};

        pubSub.subscribe('newPredicateElement', this.handleNewPredicateElement.bind(this));
        pubSub.subscribe('emptyCanvas', this.clearCanvas.bind(this));
        pubSub.subscribe('appendWidget', this.appendWidget.bind(this));

        this.store = store
    }

    setup() {
        this.addEventListenerCloseButtons();

        this.addPositionEventListeners();

        this.setupExistingQueryWidgets();
        //this.addEventListenerResizeWindow();

        this.addEventListenerResizeButton();
    }

    clearCanvas() {
        this.pageContainer.innerHTML = '';
    }

    setupExistingQueryWidgets() {
        const widgets = Array.from(this.pageContainer.querySelectorAll('.elementContainer'));
        console.log(widgets);
        if (widgets.length > 0) {
            const queryWidgets = widgets.filter((elem) => {
                return elem.getAttribute("id")?.includes("query");
            });
            console.log(queryWidgets);
            queryWidgets.forEach((widget) => this.setupNewQueryWidget(widget));
        }
    }

    setupNewQueryWidget(queryWidget) {


        const predicateName = queryWidget.getAttribute("data-predicate-name");
        const predicateArity = queryWidget.getAttribute("data-predicate-arity");

        let widgetSelects = helpers.filterChildren(queryWidget, 'SELECT');

        let widgetInputs = helpers.filterChildren(queryWidget, 'INPUT').filter(input => input.id.startsWith('input'));
        let widgetTags = helpers.filterChildren(queryWidget, 'INPUT').filter(input => input.id.startsWith('tag'));

        let widgetQueryButton = helpers.filterChildren(queryWidget, 'BUTTON')[0];

        for (let i = 0; i < predicateArity; i++) {
            this.setupTag(widgetTags[i]);

            this.setupInput(widgetInputs[i]);

            this.setupSelect(widgetSelects[i], widgetInputs[i], widgetTags[i]);
        }

        this.setupQueryButton(predicateName, predicateArity, widgetSelects, widgetInputs, widgetQueryButton);
    }

    addEventListenerCloseButtons() {
        const closeButtons = helpers.filterDescendantsByClass(this.pageContainer, 'closeButton');
        console.log(closeButtons);

        closeButtons.forEach((elem) => {
            elem.addEventListener('click', (event) => {
                event.target.closest('.elementContainer').remove();
            });
        });
    }

    handleNewPredicateElement(event) {
        const { predicate, arity } = event.detail;

        const children = this.createPredicateElements(predicate, arity)

        const predicateQueryIndex = (this.store.getState()).widgetsIndexCount.find((elem) => elem.predicate === predicate).index // this.getPredicateQueryId(predicate);
        const predicateQueryId = this.getPredicateQueryId(predicate, predicateQueryIndex)
        this.predicateQueriesInserted.push(predicateQueryIndex);
        // pubSub.publish('newQueryWidgetId', { detail: { widgetId: predicateQueryId } });
        this.store.dispatch({ type: 'ADD_PREDICATE_QUERY', payload: predicateQueryId })
        this.store.dispatch({ type: 'INCREMENT_WIDGET_INDEX', payload: predicate })

        const div = this.createQueryWidgetContainer(predicateQueryId, predicate, arity, children);


        this.setupNewQueryWidget(div);

        pubSub.publish('appendWidget', { detail: { widget: div } });
    };

    createPredicateElements(predicate, arity) {
        const children = [
            helpers.createHTMLElement("h3", { class: "text-xl font-bold max-w-[70%]", contenteditable: "true", spellcheck: "false" }, predicate) //, //Predicate name (header)
            //helpers.createHTMLElement("br")
        ];

        for (let i = 0; i < arity; i++) {
            let tag = helpers.createHTMLElement("input", { id: "tag-" + predicate + '-' + (i + 1), class: "tag", placeholder: "tag" }, null, []);

            //this.setupTag(tag);

            children.push(tag);
            children.push(document.createElement("br"));

            let inputTypeSelect = helpers.createHTMLElement("select", { id: "input-" + predicate + '-' + (i + 1) + "-type" }, null, [
                helpers.createHTMLElement("option", { value: "constant" }, "Constante"),
                helpers.createHTMLElement("option", { value: "variable" }, "Variable")
            ]);
            //this.setupSelect(predicate, i, inputTypeSelect);
            children.push(inputTypeSelect);

            let input = helpers.createHTMLElement("input", { id: "input-" + predicate + '-' + (i + 1), class: "pl-1" });
            //this.setupInput(input);
            children.push(input); //n inputs

            children.push(document.createElement("br"));
        }

        let queryButton = helpers.createHTMLElement("button", { class: "btn rounded-full bg-neutral-content" }, "Consultar"); //Button to execute query
        children.push(queryButton);
        const controlButtons = this.createControlButtons()
        children.push(controlButtons.dragButton);
        children.push(controlButtons.closeButton);

        return children
    }

    createControlButtons() {
        let closeButton = helpers.createHTMLElement("button", { class: "closeButton right-[10%]" }, "X");
        let dragButton = helpers.createHTMLElement("button", { class: "dragButton" }, '\u2630');
        closeButton.addEventListener('click', (event) => {
            const container = event.target.closest('.elementContainer');
            const widgetId = container.getAttribute('id');

            container.remove();
            this.store.dispatch({ type: 'REMOVE_PREDICATE_QUERY', payload: widgetId });
        });
        return { dragButton, closeButton };
    }

    getPredicateQueryId(predicate, id) {
        /* if (this.predicateQueriesIndexes.hasOwnProperty(predicate)) {
            this.predicateQueriesIndexes[predicate]++;
        } else {
            this.predicateQueriesIndexes[predicate] = 0;
        } */
        return `query-${predicate}-${id}`;
    }

    createQueryWidgetContainer(id, predicate, arity, children) {
        let div = helpers.createHTMLElement("div", { id, class: "elementContainer min-w-[25%] min-h-[20%] bg-base-100 flex flex-col" }, "", children);
        div.setAttribute("data-predicate-name", predicate);
        div.setAttribute("data-predicate-arity", arity);
        return div;
    }

    setupTag(tag) {
        //let tag = helpers.createHTMLElement("input", {id: "tag-"+predicate+'-'+(i+1), class: "tag", placeholder:"tag"}, null, []);

        tag.addEventListener('change', () => {
            tag.setAttribute('tag-value', tag.value);
        });

        //return tag;
    }

    setupSelect(inputTypeSelect, currentInput, currentTag) {


        inputTypeSelect.addEventListener('change', (event) => {
            //let currentInput = document.getElementById('input-'+predicate+'-'+(i+1));
            //let currentTag = document.getElementById('tag-'+predicate+'-'+(i+1));
            inputTypeSelect.setAttribute('select-type', event.target.value);

            if (event.target.value === 'variable') {
                //currentInput.setAttribute('disabled', 'true'); //commented because we shouldn't force variable names
                currentInput.value = upperCaseLetters[i]; //todo: Add possible variable names (alphabet)
                currentInput.setAttribute('input-value', upperCaseLetters[i]);
                currentTag.style.display = 'none';
            }

            if (event.target.value === 'constant'/* && currentInput.hasAttribute('disabled')*/) {
                //currentInput.removeAttribute('disabled');
                currentInput.value = '';
                currentInput.removeAttribute('input-value');
                currentTag.style.display = 'block';
            }

        });

        //return inputTypeSelect;
    }

    setupInput(input) {

        input.addEventListener('change', () => {
            input.setAttribute('input-value', input.value);
        });

        //return input;
    }

    appendWidget(event) {
        const { widget } = event.detail;
        this.pageContainer.appendChild(widget);

        widget.classList.add('wiggle');
        setTimeout(() => {
            widget.classList.remove('wiggle');
        }, 200);
    }

    addPositionEventListeners() {
        let selectedElement = null;
        let offsetX = 0;
        let offsetY = 0;

        const getEventCoordinates = (e) => {
            if (e.touches && e.touches.length > 0) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
            return { x: e.clientX, y: e.clientY };
        };

        const onMove = (event) => {
            if (!selectedElement) return;

            const { x, y } = getEventCoordinates(event);

            const containerRect = this.pageContainer.getBoundingClientRect();
            const elementRect = selectedElement.getBoundingClientRect();

            const newX = x - containerRect.left - offsetX;
            const newY = y - containerRect.top - offsetY;

            const leftBoundary = Math.max(0, Math.min(newX, containerRect.width - elementRect.width));
            const topBoundary = Math.max(0, Math.min(newY, containerRect.height - elementRect.height));

            const leftPercent = (leftBoundary / containerRect.width) * 100;
            const topPercent = (topBoundary / containerRect.height) * 100;

            selectedElement.style.left = `${leftPercent}%`;
            selectedElement.style.top = `${topPercent}%`;

            selectedElement.setAttribute('left', `${leftPercent}%`);
            selectedElement.setAttribute('top', `${topPercent}%`);
        };

        const onEnd = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            selectedElement = null;
        };

        const onStart = (event) => {
            const target = event.target;
            if (target.classList.contains('dragButton')) {
                selectedElement = target.parentElement;

                const { x, y } = getEventCoordinates(event);
                const rect = selectedElement.getBoundingClientRect();
                offsetX = x - rect.left;
                offsetY = y - rect.top;

                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('touchend', onEnd);
            }
        };

        this.pageContainer.addEventListener('mousedown', onStart);
        this.pageContainer.addEventListener('touchstart', onStart, { passive: false });
    }

    setupQueryButton(predicate, arity, selects, inputs, queryButton) {
        //let queryButton = helpers.createHTMLElement("button", {class: "btn rounded-full bg-neutral-content"}, "Consultar"); //Button to execute query
        queryButton.addEventListener('click', async (event) => {
            let query = predicate + '(';
            console.log(query);
            for (let i = 0; i < arity; i++) {
                //inputs.push(document.getElementById('input-'+predicate+'-'+(i+1)).value);
                //console.log(document.getElementById('input-'+predicate+'-'+(i+1)+'-type').value); //get input type (CONSTANT / VARIABLE)
                let currentInputType = (selects[i]).value // document.getElementById('input-' + predicate + '-' + (i + 1) + '-type').value;
                let currentInput = (inputs[i]).value // (document.getElementById('input-' + predicate + '-' + (i + 1)).value);

                if (currentInputType === 'constant') query = query + currentInput.toLowerCase()
                if (currentInputType === 'variable') query = query + currentInput.charAt(0).toUpperCase() + currentInput.slice(1);//upperCaseLetters[i];

                if (i < arity - 1) query = query + ',';
            }
            query = query + ')';

            pubSub.publish('runQuery', { detail: { query: query } });

            console.log(query);
        });

        //return queryButton;
    }

    addEventListenerResizeButton() {
        const toolbox = document.getElementById('toolboxContainer');
        const canvas = document.getElementById('pageContainer');
        const resizeHandle = document.getElementById('resizeButton');

        let isResizing = false;
        resizeHandle?.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'ns-resize';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            // const canvasContainer = canvas.parentElement;
            const newHeight = e.clientY - canvas.getBoundingClientRect().top;

            if (newHeight > 800) { // Minimum height to prevent shrinking too much
                canvas.style.height = `${newHeight}px`;
                toolbox.style.height = `${newHeight}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.body.style.cursor = 'default';
        });
    }
}