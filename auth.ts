// Authentication status check
export async function checkAuthStatus(): Promise<{ authenticated: boolean }> {
  try {
    const response = await fetch('/api/auth/status');
    if (!response.ok) {
      return { authenticated: false };
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to check authentication status:', error);
    return { authenticated: false };
  }
}

// Route protection check
export function isProtectedRoute(path: string): boolean {
  return path.startsWith('/invoices/') || 
         path.startsWith('/dashboard') || 
         path.startsWith('/settings');
}

// Render functions
export function renderLoginForm(container: HTMLElement): void {
  container.innerHTML = `
    <div id="login-form">
      <h2>Please sign in</h2>
      <form>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Sign In</button>
      </form>
    </div>
  `;
}

export function renderContent(container: HTMLElement): void {
  container.innerHTML = `<div id="content">Protected content</div>`;
}

// Main app rendering logic
export async function renderApp(): Promise<void> {
  const appElement = document.getElementById('app');
  if (!appElement) return;
  
  const authStatus = await checkAuthStatus();
  
  if (!authStatus.authenticated && isProtectedRoute(window.location.pathname)) {
    renderLoginForm(appElement);
  } else {
    renderContent(appElement);
  }
}