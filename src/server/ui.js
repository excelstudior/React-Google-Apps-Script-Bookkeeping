export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('Bookkeeping') // edit me!
    .addItem('Sheet Editor (Bootstrap)', 'openDialogBootstrap')
    // .addItem('Sheet Editor (Tailwind CSS)', 'openDialogTailwindCSS')

  menu.addToUi();
};

export const openDialogBootstrap = () => {
  const html = HtmlService.createHtmlOutputFromFile('dialog-demo-bootstrap')
    .setWidth(600)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Sheet Editor (Bootstrap)');
};

export const openDialogTailwindCSS = () => {
  const html = HtmlService.createHtmlOutputFromFile('dialog-demo-tailwindcss')
    .setWidth(600)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Sheet Editor (Tailwind CSS)');
};

