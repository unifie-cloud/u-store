import { Modal } from 'antd';
import { useContext } from 'react';
import { FullScreenContext } from './DashboardItem';

function ChartModal({ originalChartView, children }) {
  const { showModal, setShowModal } = useContext(FullScreenContext);

  return (
    <>
      {originalChartView}
      <Modal open={showModal} width={'95%'} centered onCancel={() => setShowModal(false)} footer={null}>
        <div style={{ margin: '16px' }}>{children}</div>
      </Modal>
    </>
  );
}

export default ChartModal;
