const getCurrentuser = (): any => {
    const user = localStorage.getItem("smart-inventory-user-details");
    return user ? JSON.parse(user) : null;
  };
  
  const getJwtToken = (): string | null => {
    const token = localStorage.getItem("smart-inventory-user-token");
    return token ? `Bearer ${token}` : null;
  };
  
  const logOut = (): void => {
    localStorage.removeItem("smart-inventory-user-details");
    localStorage.removeItem("smart-inventory-user-token");
    window.location.href = "/login";
  };
  

  export { getCurrentuser, getJwtToken, logOut };
  