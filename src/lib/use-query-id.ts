"use client";

import { useEffect, useState } from "react";

export function useQueryId(param = "id") {
  const [id, setId] = useState("");

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get(param) ?? "");
  }, [param]);

  return id;
}
