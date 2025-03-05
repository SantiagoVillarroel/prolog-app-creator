import { parseProgram } from '../parser.js';
import pubSub from '../pubSub.js';

//const inputFile = document.getElementById('inputFile');
//const uploadFileButton = document.getElementById('uploadFileButton');

const popupModifyCode = document.getElementById('popupContainerModifyCode');
const popupBtnModifyCodeYes = document.getElementById('btnModifyCodeYes');
const popupBtnModifyCodeNo = document.getElementById('btnModifyCodeNo');

let clickHandlerYes, clickHandlerNo;

export default class RightPanel {
    constructor() {
        this.inputCode = document.getElementById('inputCode');
        this.inputCodeButton = document.getElementById('inputCodeButton');

        this.exportPageButton = document.getElementById('exportPageButton');
        this.saveButton = document.getElementById('saveButton');

        this.resultsText = document.getElementById('results');
        this.resultsText.innerText = '';

        this.state = {
            inputCodeValue: '',
            predicates: []
        }


    }

    async setup() {
        if (this.inputCode.hasAttribute('code')) {
            console.log('has attribute code');
            this.inputCode.value = this.inputCode.getAttribute('code');
            this.state.inputCodeValue = this.inputCode.value;
            await this.uploadCode();
        }

        await this.addEventListenerUploadCode();
        this.addEventListenerSaveButton();
        this.addEventListenerExportPage();

        pubSub.subscribe('showResults', (event) => {
            this.resultsText.innerHTML = event.detail.result;
        })
    }

    async addEventListenerUploadCode() {
        this.inputCodeButton.addEventListener('click', async (event) => {
            if (this.inputCode.disabled) {
                this.handleModifyCode((result) => {
                    if (result) {
                        this.toggleInputCodeState();
                        pubSub.publish('emptyCanvas');
                    }
                });
            } else {
                await this.manageInputCode();
            }
        });
    }

    async manageInputCode() {
        this.state.inputCodeValue = this.inputCode.value;
        this.toggleInputCodeState();

        await this.uploadCode();

    }

    toggleInputCodeState() {
        this.inputCode.disabled = !this.inputCode.disabled;
        this.inputCodeButton.innerText = this.inputCode.disabled ? 'Modificar código' : 'Ingresar código';

    }

    async uploadCode() {
        try {
            this.state.predicates = parseProgram(this.state.inputCodeValue);

            this.inputCode.setAttribute('code', this.state.inputCodeValue);

            pubSub.publish('uploadCode', {
                detail: {
                    predicates: this.state.predicates,
                    inputCodeValue: this.state.inputCodeValue
                }
            });
        } catch (error) {
            console.error('Error uploading code:', error);
        }
    }

    addEventListenerSaveButton() {
        this.saveButton.addEventListener('click', () => {
            pubSub.publish('saveEditPage');
        });
    }

    addEventListenerExportPage() {
        this.exportPageButton.addEventListener('click', async () => {
            pubSub.publish('export');
        });
    }

    /*addEventListenerUploadFile(){
        uploadFileButton.addEventListener('click', () => {
            if (inputFile.files.length > 0) {
              const file = inputFile.files[0];
              if (file.name.endsWith('.pl')) {
                const reader = new FileReader();
          
                reader.onload = (event) => {
                  const fileContent = event.target.result;
                  inputCode.value = fileContent;
                };
          
                reader.readAsText(file);
              } else {
                console.log('Por favor seleccionar un archivo .pl.');
              }
            } else {
              console.log('Archivo no seleccionado.');
            }
        });
    }*/

    //*********************//

    callbackAndClosePopupModifyCode(callback, result) {
        this.closePopupModifyCode();
        callback(result);
    }

    handleModifyCodeClick(callback, result) {
        return () => {
            this.callbackAndClosePopupModifyCode(callback, result);
        };
    }

    handleModifyCode(callback) {
        popupModifyCode.style.display = 'block';

        // Assign event listener for 'Yes' button click
        clickHandlerYes = this.handleModifyCodeClick(callback, true);
        popupBtnModifyCodeYes.addEventListener('click', clickHandlerYes);

        // Assign event listener for 'No' button click
        clickHandlerNo = this.handleModifyCodeClick(callback, false);
        popupBtnModifyCodeNo.addEventListener('click', clickHandlerNo);
    }

    /*
    handleModifyCode(callback) {
        popupModifyCode.style.display = 'block';
    
        // Use arrow functions to automatically bind 'this'
        clickHandlerYes = () => this.callbackAndClosePopupModifyCode(callback, true);
        popupBtnModifyCodeYes.addEventListener('click', clickHandlerYes);
    
        clickHandlerNo = () => this.callbackAndClosePopupModifyCode(callback, false);
        popupBtnModifyCodeNo.addEventListener('click', clickHandlerNo);
    }

    */

    closePopupModifyCode() {
        popupModifyCode.style.display = 'none';

        // Remove event listeners using stored references
        popupBtnModifyCodeYes.removeEventListener('click', clickHandlerYes);
        popupBtnModifyCodeNo.removeEventListener('click', clickHandlerNo);
    }
}