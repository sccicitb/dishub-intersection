"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export const logout = () => {
  Cookies.remove("token");
  window.location.href = "/auth";
}

export const Logout = () => {
  return (
    <button className="btn btn-square w-fit px-2 btn-sm place-items-center " onClick={logout}>Logout</button>
  )
}