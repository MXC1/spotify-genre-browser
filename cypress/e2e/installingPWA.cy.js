beforeEach(() => {
  caches.keys().then(function (names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
});

function setupBeforeInstallPrompt(win, outcome) {
  // Spy on console.log
  cy.window().then((win) => {
    cy.spy(win.console, 'log').as('consoleLog');
  });

  // Create a mock event with a `prompt` function
  const event = new Event('beforeinstallprompt');
  event.prompt = cy.stub().as('promptStub');
  event.userChoice = Promise.resolve({ outcome });

  // Store the event so the app can access it
  Object.defineProperty(win, 'deferredPrompt', {
    value: event,
    writable: true,
  });
}

describe('GIVEN I visit the app on a PWA-enabled device', () => {
  beforeEach(() => {
    cy.resetIndexedDb();

    cy.visit('/', {
      onBeforeLoad(win) {
        setupBeforeInstallPrompt(win, 'accepted');
      },
    });

    cy.get('@consoleLog').should('have.been.calledWithMatch', /Adding beforeinstallprompt event listener/);

    cy.window().then((win) => {
      const event = win.deferredPrompt;
      win.dispatchEvent(event);
      cy.log(`beforeinstallprompt event dispatched: ${event.type}`);
    });
  });

  describe('WHEN the user clicks the install button', () => {
    beforeEach(() => {

      cy.get('.menu-button').click();
      cy.get('.menu-item').contains('Install the app').click()
      cy.get('.modal-button').contains('Install').click();
    })
    
    it('THEN the app should be installed', () => {
      cy.get('@consoleLog').should('have.been.calledWithMatch', /Showing install prompt/);
      cy.get('@consoleLog').should('have.been.calledWithMatch', /Install prompt decision/);
      cy.get('@consoleLog').should('have.been.calledWithMatch',
        /Install prompt decision/,
        Cypress.sinon.match.has('action', 'accepted'));
    });

    it('THEN the install button should not be visible', () => {
      cy.get('.menu-button').click();
      cy.get('.menu-item').contains('Install the app').should('not.exist');
    });
  });

  describe('WHEN the user declines the installation modal', () => {
    beforeEach(() => {
      cy.get('.menu-button').click();
      cy.get('.menu-item').contains('Install the app').click();
      cy.get('.modal-button').contains('Cancel').click();
    });

    it('THEN the app should log the dismissal', () => {
      cy.get('@consoleLog').should('have.been.calledWithMatch', /User canceled the install modal/);
      cy.get('.menu-button').click();
      cy.get('.menu-item').contains('Install the app').should('exist');
    });
  });
  
  describe('WHEN the installation fails', () => {
    beforeEach(() => {
      cy.get('.menu-button').click();
      cy.get('.menu-item').contains('Install the app').click();
    
      // Simulate an error during the installation process
      cy.get('@promptStub').then((promptStub) => {
        promptStub.throws(new Error('PWA Error'));
      });
    
      cy.get('.modal-button').contains('Install').click();
    });

    it('THEN the app should log the installation failure', () => {
      cy.get('@consoleLog').should('have.been.calledWithMatch',
        /Install prompt error/,
        Cypress.sinon.match.has('errorMessage', 'PWA Error'));
    });
  });
});

describe('GIVEN I visit the app on a non-PWA-enabled device', () => {
  beforeEach(() => {
    cy.resetIndexedDb();
    cy.visit('/');
  });

  it('THEN the install button should not be visible', () => {
    cy.get('.menu-button').click();
    cy.get('.menu-item').contains('Install the app').should('not.exist');
  });
});

describe('GIVEN the beforeinstallprompt event is not available', () => {
  beforeEach(() => {
    cy.resetIndexedDb();
    cy.visit('/', {
      onBeforeLoad(win) {
        // Ensure no deferredPrompt is set
        Object.defineProperty(win, 'deferredPrompt', {
          value: null,
          writable: true,
        });
      },
    });
  });

  it('THEN the install button should not be visible', () => {
    cy.get('.menu-button').click();
    cy.get('.menu-item').contains('Install the app').should('not.exist');
  });
});

describe('GIVEN the user dismisses the beforeinstallprompt event', () => {
  beforeEach(() => {
    cy.resetIndexedDb();

    cy.visit('/', {
      onBeforeLoad(win) {
        setupBeforeInstallPrompt(win, 'dismissed');
      },
    });

    cy.get('@consoleLog').should('have.been.calledWithMatch', /Adding beforeinstallprompt event listener/);

    cy.window().then((win) => {
      const event = win.deferredPrompt;
      win.dispatchEvent(event);
      cy.log(`beforeinstallprompt event dispatched: ${event.type}`);
    });
  });
  
  it('THEN the app should log the dismissal', () => {
    cy.get('.menu-button').click();
    cy.get('.menu-item').contains('Install the app').click();
    cy.get('.modal-button').contains('Install').click();
      cy.get('@consoleLog').should('have.been.calledWithMatch', /Showing install prompt/);
      cy.get('@consoleLog').should('have.been.calledWithMatch', /Install prompt decision/);
      cy.get('@consoleLog').should('have.been.calledWithMatch',
        /Install prompt decision/,
        Cypress.sinon.match.has('action', 'dismissed'));
  });
});
