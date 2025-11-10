var pageContextMenuElement = document.querySelector('#page-context-menu')
var navbarElement = document.querySelector('#navbar')

if (pageContextMenuElement && navbarElement) {
  navbarElement.appendChild(pageContextMenuElement);
  pageContextMenuElement.style.display = 'flex';
}