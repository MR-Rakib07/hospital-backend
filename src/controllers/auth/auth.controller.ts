import type { NextFunction, Request, Response } from "express";
import { registerUser } from "../../services/auth/auth.services";

export const register = async(req:Request,res:Response, next:NextFunction)=>{
  try {
    const user = await registerUser(req.body)
    res.status(201).json({
      success:true,
      message:'user registered successfully',
      data:user
    })
  } catch (error:any) {
    error.statusCode = error.statusCode||400
    next(error)
  }
}