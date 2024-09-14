import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Mathdle, Config, Theme} from "../.";

const App = () => {



  return (
    <div style={
        {
            width: '100vw',
            height: '100%',
            display: 'grid',
            alignItems: 'center',
            justifyItems: 'center',
            color: 'black',
            fontFamily: 'Arial, sans-serif',
        }
    }>
      <Mathdle />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
