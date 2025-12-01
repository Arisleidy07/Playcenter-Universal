import React from "react";
import LoadingSpinner from "../LoadingSpinner";

export function Loader({ visible, text = "Cargando..." }) {
  if (!visible) return null;
  return <LoadingSpinner fullScreen text={text} />;
}
