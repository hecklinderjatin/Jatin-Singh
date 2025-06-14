
const ModelPopup = ({ message }) => {
  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#333',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '10px',
      zIndex: 9999,
      fontSize: '14px',
    }}>
      {message}
    </div>
  );
};

export default ModelPopup;
