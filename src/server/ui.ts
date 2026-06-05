export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('Bookkeeping')
    .addItem('🖥️ Launch Database Studio ORM', 'openDatabaseStudio')

  menu.addToUi();
};

export const openDatabaseStudio = (): void => {
  const html = HtmlService.createHtmlOutputFromFile('database-studio')
    .setWidth(950) // Wide modal to give the dashboard workspace full room
    .setHeight(650);
  SpreadsheetApp.getUi().showModalDialog(html, 'Sheets ORM Kernel Studio');
};