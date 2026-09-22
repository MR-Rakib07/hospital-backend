import type { NextFunction, Request, Response } from "express";
import { changePasswordService, getMyProfile, loginUser, refreshAccessToken, registerUser, updateProfileService } from "../../services/auth/auth.services";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware";

// register
export const register = async(req:Request,res:Response, next:NextFunction)=>{
  try {
    const user = await registerUser(req.body)
    res.status(201).json({
      success:true,
      message:'user registered successfully',
      data:user
    })
  } catch (error:any) {
    next(error)
  }
}

// login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken } = await loginUser(req.body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      accessToken,
      
    });
  } catch (error) {
    next(error);
  }
};

// refreshToken
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    const result = await refreshAccessToken(token);

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
// logout
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// getME
export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await getMyProfile(req.user.id);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// changePassword
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const result = await changePasswordService({
      userId: req.user!.id,
      oldPassword,
      newPassword,
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// updateProfile 
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, role, id, ...allowedUpdates } = req.body;

    const user = await updateProfileService(req.user!.id, allowedUpdates);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};