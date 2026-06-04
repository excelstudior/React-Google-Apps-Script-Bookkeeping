import { useState, useEffect } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Button, ListGroup } from 'react-bootstrap';
import { VENDOR, HTML_VENDOR_FORM } from '../../../shared/constants';
// import FormInput from './FormInput';

// This is a wrapper for google.script.run that lets us use promises.
import {
  serverFunctions,
  scriptHostFunctions,
} from '../../utils/serverFunctions';

const SheetEditor = () => {
  const [names, setNames] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    serverFunctions.getSheetsData().then(setNames).catch(alert);
  }, []);

  // const setActiveSheet = (sheetName) => {
  //   serverFunctions.setActiveSheet(sheetName).then(setNames).catch(alert);
  // };

  // const submitNewSheet = async (newSheetName) => {
  //   try {
  //     const response = await serverFunctions.addSheet(newSheetName);
  //     setNames(response);
  //   } catch (error) {
  //     // eslint-disable-next-line no-alert
  //     alert(error);
  //   }
  // };

  return (
    <div style={{ padding: '3px', overflowX: 'hidden' }}>
      <p>
        <b>☀️ {VENDOR} ☀️</b>
      </p>
      {/* <FormInput submitNewSheet={submitNewSheet} /> */}
      {/* <ListGroup>
        <TransitionGroup className="sheet-list">
          {names.length > 0 &&
            names.map((name) => (
              <CSSTransition
                classNames="sheetNames"
                timeout={500}
                key={name.name}
              >
                <ListGroup.Item
                  className="d-flex"
                  key={`${name.index}-${name.name}`}
                >
                  <Button
                    className="border-0 mx-2"
                    variant={name.isActive ? 'success' : 'outline-success'}
                    onClick={() => setActiveSheet(name.name)}
                  >
                    {name.name}
                  </Button>
                  <Button
                    className="border-0"
                    variant="outline-danger"
                    size="sm"
                    onClick={() => deleteSheet(name.index)}
                  >
                    &times;
                  </Button>
                </ListGroup.Item>
              </CSSTransition>
            ))}
        </TransitionGroup>
      </ListGroup> */}
      {/* {names.length > 0 && (
        <div className="d-flex justify-content-end py-3">
          {!isExpanded ? (
            <Button
              variant="light"
              className="mr-2"
              onClick={() => {
                scriptHostFunctions.setHeight(1000);
                scriptHostFunctions.setWidth(1000);
                setIsExpanded(true);
              }}
            >
              Expand Dialog
            </Button>
          ) : null}
          <Button
            variant="outline-dark"
            onClick={() => scriptHostFunctions.close()}
          >
            Close Dialog Window
          </Button>
        </div>
      )} */}
    </div>
  );
};

export default SheetEditor;
