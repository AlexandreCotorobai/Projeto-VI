import { useDimensions } from "../../hooks/useDimensions.js";
import { useRef } from "react";

export const ResponsiveWrapper = ({ children }) => {
  const wrapperRef = useRef();
  const { width, height } = useDimensions(wrapperRef);

  return (
    <div className={"w-full h-96"} ref={wrapperRef}>
      {children({ width, height })}
    </div>
  );
};
