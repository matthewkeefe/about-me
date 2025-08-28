const app = document.getElementById('app');
app.innerHTML = `
  <h1>Hello from Vite</h1>
  <p>Edit <code>src/main.js</code> and refresh.</p>
`;

if (import.meta.hot) {
  import.meta.hot.accept();
}
