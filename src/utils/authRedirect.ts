export const AUTH_REDIRECT_PATHS = {
  AFTER_SIGNOUT: '/login',  // Default redirect to login page after signout
  AFTER_LOGIN: '/dashboard' // Default redirect after login
};

export const handleSignOut = () => {
  // Handle any cleanup needed
  window.location.href = AUTH_REDIRECT_PATHS.AFTER_SIGNOUT;
};
