import { useState } from "react";

export default () => {
  const [domUpdateDid, setDomUpdateDid] = useState(0);

  const updateDom = () => {
    setDomUpdateDid(domUpdateDid + 1)
  }

  return { domUpdateDid, updateDom }
}