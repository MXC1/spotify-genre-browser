describe('React App', () => {
  it('should load the login container', () => {
    cy.visit('/');
    cy.contains('Login with Spotify');
  });
});
