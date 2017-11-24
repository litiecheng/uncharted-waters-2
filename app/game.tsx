import * as React from "react";
import * as ReactDOM from "react-dom";

import { Left, Right, Building } from "./interface";

ReactDOM.render(
  <div id="center">
    <main id="app">
      <canvas id="camera" width="1280" height="800" />
    </main>
  </div>,
  document.getElementById("root"),
);
