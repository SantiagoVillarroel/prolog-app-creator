import * as helpers from '../helpers.js';
import pubSub from '../pubSub.js';

const popupImagesContainer = document.getElementById('popupContainerImages');
const popupImages = document.getElementById('popupImages');
const popupImagesCloseButton = document.getElementById('popupImagesCloseButton');

export default class Toolbox {
    constructor() {
        this.predicatesContainer = document.getElementById('predicatesContainer');
        this.elementsContainer = document.getElementById('elementsContainer');
        this.toolboxContainer = document.getElementById('toolboxContainer');

        this.mappingElementsIndex = { 'header': 0 };
    }

    setup() {

        const headerButton = this.createElementButton("Título", "header-widget-button");
        const imageButton = this.createElementButton("Imagen", "image-widget-button");

        // Append buttons to the container
        this.updateContainerWithButtons(this.elementsContainer, [headerButton, imageButton]);

        // this.addEventListenerCodeInput();

        // Subscribe to code input event using Pub/Sub
        this.subscribeToCodeInput();

        this.addImages();

        popupImagesCloseButton.addEventListener('click', () => popupImagesContainer.style.display = 'none')

    }

    createElementButton(label, className) {
        return helpers.createHTMLElement("button", { class: `btn rounded-full w-[70%] m-1 ${className}` }, label);
    }

    updateContainerWithButtons(container, buttons) {
        this.removeChildrenFromContainer(container);
        buttons.forEach(button => container.appendChild(button));
        this.addEventListenerElementWidget(buttons);
    }

    subscribeToCodeInput() {
        pubSub.subscribe('codeInput', (event) => {
            this.removeChildrenFromContainer(this.predicatesContainer);
            this.createPredicateButtons(event.detail.predicates);
        });
    }

    createPredicateButtons(predicates) {
        let predicateButtons = [];
        predicates.forEach(elem => {
            const predicateString = this.generatePredicateButtonString(elem.name, elem.arity);
            const predicateButton = helpers.createHTMLElement("button", { class: "btn rounded-full bg-neutral-content" }, predicateString);
            predicateButton.dataset.info = elem.arity;
            predicateButtons.push(predicateButton);
            this.predicatesContainer.appendChild(predicateButton);
            this.predicatesContainer.appendChild(document.createElement("br"));

            if (this.toolboxContainer.scrollHeight > this.toolboxContainer.clientHeight) {
                this.toolboxContainer.style.height = (initialHeight + predicateButton.clientHeight + 5) + 'px';
            }
        });
        this.addEventListenerNewQueryWidget(predicateButtons); // Attach event listeners
    }

    async addImages() {
        const response = await fetch('/images');
        console.log(response)
        const images = await response.json();
        console.log(images)

        popupImages.replaceChildren()

        images.forEach((image) => {
            const imageThumbnail = helpers.createHTMLElement("img", {
                class: "w-full h-auto transition-transform duration-300 ease-in-out transform hover:scale-105",
                src: `/public/imgs/${image}`, alt: image
            })
            const imageElement = helpers.createHTMLElement("img", {
                class: "",
                src: `/public/imgs/${image}`, alt: image
            })

            popupImages.appendChild(imageThumbnail);

            imageThumbnail.addEventListener('click', () => {
                let closeButton = helpers.createHTMLElement("button", { class: "closeButton" }, "X");
                let dragButton = helpers.createHTMLElement("button", { class: "dragButton" }, '\u2630')
                closeButton.addEventListener('click', (event) => {
                    event.target.closest('.elementContainer').remove();
                    //event.target.parentNode.parentNode.parentNode;
                });

                let div = helpers.createHTMLElement("div", { class: "elementContainer max-w-xs" }, "", [
                    imageElement,
                    dragButton,
                    closeButton
                ]);

                popupImagesContainer.style.display = 'none'
                pubSub.publish('appendWidget', { detail: { widget: div } });
            })
        })
    }

    addEventListenerNewQueryWidget(predicateButtonsList) {
        //Create predicate buttons event listeners
        console.log('Add event list new query widget' + predicateButtonsList);
        predicateButtonsList.forEach((elem) => {
            elem.addEventListener('click', () => {
                let predicateButtonName = elem.innerHTML;
                let predicate = predicateButtonName.split('(')[0];
                let arity = elem.dataset.info;

                pubSub.publish('newPredicateElement',
                    {
                        detail:
                        {
                            predicate: predicate,
                            arity: arity
                        }
                    }
                );
            });
        });
    }

    removeChildrenFromContainer(container) {
        //Remove all children but the first one
        const children = container.children;
        // Start removing elements from the second one
        for (let i = children.length - 1; i > 0; i--) {
            container.removeChild(children[i]);
        }
    }

    generatePredicateButtonString(predicate, arity) {
        let predicateString = predicate + '( ';

        for (let i = 0; i < arity; i++) {
            predicateString += '\u25A1 ';
        }

        predicateString += ')';

        return predicateString;
    }

    addEventListenerElementWidget(elementButtonsList) {
        //When element buttons are clicked...
        elementButtonsList.forEach((elem) => {
            elem.addEventListener('click', async (event) => {
                let closeButton = helpers.createHTMLElement("button", { class: "closeButton" }, "X");
                let dragButton = helpers.createHTMLElement("button", { class: "dragButton" }, '\u2630')
                /* let dragButton = helpers.createHTMLElement("button", {class: "dragButton"}, '', 
                    [helpers.createHTMLElement("i", { alt: "Drag Icon", class: "fa-regular fa-arrows-up-down-left-right" })]
                ) */

                closeButton.addEventListener('click', (event) => {
                    event.target.closest('.elementContainer').remove();
                    //event.target.parentNode.parentNode.parentNode;
                });

                let div;

                switch (elem.innerHTML) {
                    case 'Título':
                        this.handleTitleWidget(closeButton);
                        break;
                    case 'Imagen': //Handle image
                        console.log("case Image");
                        popupImagesContainer.style.display = 'block'
                        /*const svgText = await this.getSVGFile('/client/static/imgs/1682268254kawaiicat1.svg');
                        //const dragIcon = await this.getSVGFile('/client/static/imgs/draggable-svgrepo-com.svg')
    
                        div = helpers.createHTMLElement("div", {class: "elementContainer min-h-[30%] min-w-[30%]"}, "", [
                            helpers.createHTMLElement("svg", {}, svgText),
                            dragButton,
                            closeButton
                        ]);*/

                        //this.dispatchEventAppendToCanvas(div);

                        /*activatePopup();
                        handlePopupInput(function (popupInput){
                            console.log("handle pop input")
                            let img = helpers.createHTMLElement("img", {src: popupInput});
                            div = helpers.createHTMLElement("div", {class: "elementContainer"}, "", [
                                img,
                                closeButton]);
                            this.dispatchEventAppendToCanvas(div);
                        });*/
                        break;
                }
            });
        });
    }

    handleTitleWidget(closeButton){
        let id = 'header' + this.mappingElementsIndex['header'];
        let dragButton = helpers.createHTMLElement("button", { class: "dragButton" }, '\u2630')
        this.mappingElementsIndex['header']++;
        const div = helpers.createHTMLElement("div", { id: id, class: "elementContainer w-[25%] h-[12%] bg-neutral-content rounded-3xl border-black flex justify-center items-center" }, "", [//elementContainer
            helpers.createHTMLElement("div", { class: "text-4xl font-bold", contenteditable: "true", spellcheck: "false" }, "Titulo"),
            dragButton,
            //helpers.createWidgetPositionButtons(id),
            closeButton]);

        pubSub.publish('appendWidget', { detail: { widget: div } });
    }

    async getSVGFile(route) {
        const response = await fetch(route);
        const svgText = await response.text();

        return svgText;
    }
}