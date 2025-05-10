beforeEach(() => {
  caches.keys().then(function (names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
});


describe('GIVEN I visit the app on a PWA-enabled device', () => {
  beforeEach(() => {
    cy.resetIndexedDb();

    cy.visit('/', {
        onBeforeLoad(win) {
          // Spy on console.log
          cy.window().then((win) => {
            cy.spy(win.console, 'log').as('consoleLog');
          });

          // Create a mock event with a `prompt` function
          const event = new Event('beforeinstallprompt');
          event.prompt = cy.stub().as('promptStub');
          event.userChoice = Promise.resolve({ outcome: 'accepted' });
          
          // Store the event so the app can access it
          Object.defineProperty(win, 'deferredPrompt', {
            value: event,
            writable: true,
          });
        }
      });
    
    cy.get('@consoleLog').should('have.been.calledWithMatch', /Adding beforeinstallprompt event listener/);

    cy.window().then((win) => {
      const event = win.deferredPrompt;
      win.dispatchEvent(event);
      cy.log(`beforeinstallprompt event dispatched: ${event.type}`);
    });
  });

  it('THEN the install button should be shown', () => {
    cy.get('.menu-button').click();
    cy.get('.menu-item').contains('Install the app').should('be.visible');
  });
});