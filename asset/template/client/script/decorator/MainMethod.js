function MainMethod(value, { kind, name, }) {
  if (kind === 'method') {
    if (name !== 'ownComponentDidMount') {
      console.error('[Error] the main methods should be used in the "ownComponentDidMount" method.');
    }
  }
}

export default MainMethod;
