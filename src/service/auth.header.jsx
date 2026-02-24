export function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    return {
      Authorization: `Bearer ${user.token}`,
      username: user.username // only if needed by your backend
    };
  } else {
    return {};
  }
}
