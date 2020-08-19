import React, { Fragment } from "react";

const NotFound = () => {
  return (
    <Fragment>
      <h1
        className="x-large text-primary container"
        style={{ position: "absolute", top: "3em" }}
      >
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        Page Not Found
      </h1>
      <p
        className="large container"
        style={{ position: "absolute", top: "8em" }}
      >
        Sorry, this Page Does Not Exist
      </p>
    </Fragment>
  );
};

export default NotFound;
