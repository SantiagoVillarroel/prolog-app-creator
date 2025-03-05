
export function createHTMLElement(tag, attributes, content, children) {
  const element = document.createElement(tag);

  // Set attributes
  if (attributes) {
    for (const attr in attributes) {
      element.setAttribute(attr, attributes[attr]);
    }
  }

  // Set content
  if (content) {
    element.innerHTML = content;
  }

  // Append child elements
  if (children) {
    children.forEach(child => {
      element.appendChild(child);
    });
  }

  return element;
}

export function filterChildren(div, elementType) {
  let children = div.children;

  return Array.from(children).filter(child => {
    return (
      child.nodeType === 1 &&
      child.tagName === elementType
    );
  });
}

export function filterChildrenByClass(div, className) {
  let children = div.children;

  console.log(children);

  return Array.from(children).filter(child => {
    return (
      child.nodeType === 1 &&
      child.classList.contains(className)
    );
  });
}

export function filterDescendantsByClass(div, className) {
  let result = [];

  function filterElements(element) {
    // Check if the current element has the specified class
    if (element.nodeType === 1 && element.classList.contains(className)) {
      result.push(element);
    }

    // Recursively check the children of the current element
    for (let i = 0; i < element.children.length; i++) {
      filterElements(element.children[i]);
    }
  }

  // Start the filtering from the provided div element
  filterElements(div);

  return result;
}

export function createWidgetPositionButtons(predicateQueryId) {
  let leftButton = createHTMLElement("button", { class: "positionButton btn rounded-full bg-neutral-content" }, "&#x2190;");
  let centerButton = createHTMLElement("button", { class: "positionButton btn rounded-full bg-neutral-content" }, "-");
  let rightButton = createHTMLElement("button", { class: "positionButton btn rounded-full bg-neutral-content" }, "&#x2192;");

  const buttons = [leftButton, centerButton, rightButton];

  buttons.forEach((button, i) => {
    button.addEventListener('click', (e) => {
      let predicateQueryCol = document.getElementById(predicateQueryId).parentNode;

      predicateQueryCol.classList.remove('col-md-offset-0', 'col-md-offset-4', 'col-md-offset-8');

      predicateQueryCol.classList.add(`col-md-offset-${4 * i}`);
    })
  })

  return createHTMLElement("div", { class: "positionButtonContainer" }, "", [
    leftButton,
    centerButton,
    rightButton
  ]);
}