import { FullscreenOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import React, { useState } from 'react';
// import { buttonColor, flexDisplay, floatingRight, spaceHeight, spaceWidth } from 'utils/styles';
import { createContext } from 'react';

export const FullScreenContext = createContext<{
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}>({
  showModal: false,
  setShowModal: () => {},
});

const DashboardItem = ({ children, title, needFullScreenView = true }) => {
  const [showModal, setShowModal] = useState(false);

  const FullScreenIcon = () => {
    if (!needFullScreenView) {
      return null;
    }
    return (
      <Button
        icon={<FullscreenOutlined />}
        onClick={() => setShowModal(true)}
        title="Click here for Full Screen View"
      />
    );
  };
  return (
    <FullScreenContext.Provider value={{ showModal, setShowModal }}>
      <Card
        title={title}
        extra={<FullScreenIcon />}
        style={{
          /* ...spaceHeight, ...spaceWidth, ...flexDisplay,*/ flexDirection:
            'column',
        }}
      >
        {children}
      </Card>
    </FullScreenContext.Provider>
  );
};

export default DashboardItem;
