import QueryManager from './TopLevelProc-copy.js';
import * as helpers from './helpers.js';

import { getPageInfo } from './services/exportService.js';

let queryManager = new QueryManager();
(async() => {

  await queryManager.start_ciao_worker();

  const route = window.location.pathname.split('/export/')[1];

  
  const pageInfo = await getPageInfo(route)
  
  await queryManager.upload_code_to_worker(pageInfo.code);
  await queryManager.run_query("use_module('/draft.pl')", '');

  pageSetup(pageInfo);
})();

const upperCaseLetters = ['X', 'Y', 'Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']

const resultsText = document.getElementById('results');

function pageSetup(pageInfo){

  pageInfo.predicateQueriesIds.forEach((elem) => {
    let element = document.getElementById(elem);

    element.style.left = element.getAttribute('left');
    element.style.top = element.getAttribute('top');

    let predicateQuerySelects = helpers.filterChildren(element, 'SELECT');

    let predicateQueryInputs = helpers.filterChildren(element, 'INPUT').filter(input => input.id.startsWith('input'));
    let predicateQueryTags = helpers.filterChildren(element, 'INPUT').filter(input => input.id.startsWith('tag'));

    let predicateQueryButton = helpers.filterChildren(element, 'BUTTON');

    const predicate = elem.split('-')[1];
    const arity = predicateQueryInputs.length;

    fillInputsAndDisableSelects(predicateQueryInputs, predicateQueryTags, predicateQuerySelects);

    manageSelects(predicateQuerySelects, predicateQueryInputs);

    manageQuery(predicateQueryButton, predicate, predicateQueryInputs, predicateQuerySelects, arity);

  });
}

function manageQuery(predicateQueryButton, predicate, predicateQueryInputs, predicateQuerySelects, arity) {
  predicateQueryButton[0].addEventListener('click', async (event) => {
    let query = predicate + '(';


    predicateQueryInputs.forEach((input, i) => {

      let currentInputType = predicateQuerySelects[i].value;
      let currentInput = input.value;

      if (currentInputType === 'constant') query = query + currentInput.toLowerCase();
      if (currentInputType === 'variable') query = query + currentInput.charAt(0).toUpperCase() + currentInput.slice(1); //upperCaseLetters[i];

      if (i < arity - 1) query = query + ',';
    });

    query = query + ')';

    const res = await queryManager.run_query_all_results(query, '');

    resultsText.innerHTML = res;
  });
}

function manageSelects(predicateQuerySelects, predicateQueryInputs) {
  predicateQuerySelects.forEach((select, i) => {
    let selectedIndex = select.getAttribute('select-type') === 'variable' ? 1 : 0;
    select.selectedIndex = selectedIndex;

    select.addEventListener('change', (event) => {
      let currentInput = predicateQueryInputs[i];
      if (event.target.value === 'variable') {
        currentInput.value = upperCaseLetters[i];
      }

      if (event.target.value === 'constant') {
        currentInput.value = '';
      }

    });
  });
}

function fillInputsAndDisableSelects(predicateQueryInputs, predicateQueryTags, predicateQuerySelects) {
  predicateQueryInputs.forEach((input, i) => {
    predicateQuerySelects[i].style.display = 'none';

    if(predicateQuerySelects[i].getAttribute('select-type') === 'variable'){
      input.style.display = 'none';
    }

    if (input.getAttribute('input-value')) {
      //predicateQuerySelects[i].setAttribute('disabled', 'true');
      input.setAttribute('disabled', 'true');
      input.value = input.getAttribute('input-value');
    }
  });

  predicateQueryTags.forEach((tag, i) => {
    if (tag.getAttribute('tag-value')) {
      tag.setAttribute('disabled', 'true');
      tag.value = tag.getAttribute('tag-value');
    }else{
      tag.style.display='none';
    }
  });
}