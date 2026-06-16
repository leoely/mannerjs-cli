function RestMethod(index) {
  return (value, { kind, name, }) => {
    if (!Number.isInteger(index)) {
      console.error('[Error] The decorator index should be an integer.');
    }
  };
}

export default RestMethod;
