import axios from 'axios';
import config from '../environment/config';
import { authHeader } from './auth.header';
import { authenticationDetails } from './admin.service';

const API_URL = config.API_URL;


export const login = async (username, password) => {
  try {
    const normalizedUsername = username.trim();

    const loginData = {
      username: normalizedUsername,
      password,
      timestamp: new Date().toISOString(),
    };

    const response = await authenticationDetails(loginData);
    const authData = response?.data;

    // Default password: JWT is required for the change-password API.
    if (authData?.statusCode === "DEFAULT_PASSWORD") {
      if (!authData.token) {
        throw new Error(
          "Authentication succeeded, but no token was returned for changing your password."
        );
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          token: authData.token,
          username: normalizedUsername,
        })
      );

      localStorage.setItem("username", normalizedUsername);

      localStorage.setItem(
        "roles",
        JSON.stringify(authData.roles || [])
      );

      return authData;
    }

    if (!authData?.token) {
      throw new Error(
        authData?.message ||
        "We couldn't sign you in. Please try again."
      );
    }

    // Save the authenticated session before checking the login code.
    localStorage.setItem(
      "user",
      JSON.stringify({
        token: authData.token,
        username: normalizedUsername,
      })
    );

    localStorage.setItem("username", normalizedUsername);
    localStorage.setItem("roles", JSON.stringify(authData.roles || []));

    const roles = authData.roles || [];
    const hindiRoles = authData.hindiRoles || [];
    const hindiRoleMap = {};

    roles.forEach((role, index) => {
      hindiRoleMap[role] = hindiRoles[index];
    });

    localStorage.setItem(
      "hindiRoleMap",
      JSON.stringify(hindiRoleMap)
    );

    // Existing normal-login logic remains unchanged.
    const emp = await getUserDetails(normalizedUsername);

    if (!emp) {
      throw new Error(
        "Your login was successful, but we couldn't load your employee details. Please contact your administrator."
      );
    }

    localStorage.setItem("loginId", emp?.data?.loginId ?? "");
    localStorage.setItem("empId", emp?.data?.empId ?? "");
    localStorage.setItem("empName", emp?.data?.empName ?? "");
    localStorage.setItem("roleName", emp?.data?.roleName ?? "");
    localStorage.setItem("designationCode", emp?.data?.empDesigName ?? "");
    localStorage.setItem("title", emp?.data?.title ?? "");
    localStorage.setItem("salutation", emp?.data?.salutation ?? "");
    localStorage.setItem("roleId", emp?.data?.roleId ?? "");
    localStorage.setItem("hindiEmpDesigName", emp?.data?.hindiEmpDesigName ?? "");
    localStorage.setItem("hindiEmpName", emp?.data?.hindiEmpName ?? "");
    localStorage.setItem("hindiRoleName", emp?.data?.hindiRoleName ?? "");
    localStorage.setItem("hindiSalutation", emp?.data?.hindiSalutation ?? "");
    localStorage.setItem("hindiTitle", emp?.data?.hindiTitle ?? "");
    localStorage.setItem("isGroup", emp?.data?.isGroup ?? "");

    await customAuditStampingLogin(normalizedUsername);

    return authData;
  } catch (error) {
    console.error("Error occurred in login:", error);
    throw error;
  }
};


export const setLocalStorageData = async (username) => {
  if (!username) {
    throw new Error('No user found');
  }

  try {

    localStorage.setItem('roles', JSON.stringify([]))

    const emp = await getUserDetails(username);

    localStorage.setItem('loginId', emp?.data.loginId);
    localStorage.setItem('empId', emp?.data.empId);
    localStorage.setItem('empName', emp?.data.empName);
    localStorage.setItem('roleName', emp?.data.roleName);
    localStorage.setItem('designationCode', emp?.data.empDesigName);
    localStorage.setItem('title', emp?.data.title);
    localStorage.setItem('roleId', emp?.data.roleId);

    await customAuditStampingLogin(username);

  } catch (error) {
    console.error('Error occurred in setLocalStorageData()', error);
    throw error;
  }
};

export const logout = async (logoutType) => {
  const user = getCurrentUser();
  if (user && user.username) {
    try {
      await customAuditStampingLogout(user.username, logoutType);
      // localStorage.clear();
    } catch (error) {
      console.error('Error occurred in logout:', error);
      throw error;
    }
  } else {
    localStorage.clear();
  }
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const getUserDetails = async (username) => {
  if (!username) {
    throw new Error('No user found');
  } try {
    return (await axios.get(`${API_URL}api/master/getUser/${username}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
  } catch (error) {
    console.error('Error occurred in getUserDetails():', error);
    throw error;
  }
};

export const customAuditStampingLogin = async (username) => {
  if (!username) {
    throw new Error('No user found');
  }

  try {
    const response = await axios.post(
      `${API_URL}api/admin/custom-audit-stamping-login`,
      username,
      { headers: { 'Content-Type': 'application/json', ...authHeader() } }
    );
    return response.data;
  } catch (error) {
    console.error('Error occurred in customAuditStampingLogin:', error);
    throw error;
  }
};

export const customAuditStampingLogout = async (username, logoutType) => {
  if (!username) {
    throw new Error('No user found');
  }

  try {
    const response = await axios.post(
      `${API_URL}api/admin/custom-audit-stamping-logout`,
      { username, logoutType },
      { headers: { 'Content-Type': 'application/json', ...authHeader() } }
    );
    return response.data;
  } catch (error) {
    console.error('Error occurred in customAuditStampingLogout:', error);
    throw error;
  }
}


export const getLicense = async () => {
  const response = await axios.get(
    `${API_URL}api/admin/get-license`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  // The API must return an actual Boolean.
  // HTTP/network errors will be thrown to the caller.
  if (typeof response.data !== "boolean") {
    throw new Error("Invalid response from license server");
  }

  return response.data;
};
