import React, { Fragment } from "react";
import spinner from "../../assets/img/Spinner.gif";
const Spinner = () => {
  const style = {
    width: "200px",
    margin: "auto",
    display: "block",
  };
  return (
    <Fragment>
      <img src={spinner} style={style} alt="loading...." />
    </Fragment>
  );
};

export default Spinner;
