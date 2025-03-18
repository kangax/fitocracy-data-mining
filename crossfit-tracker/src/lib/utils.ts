const formatWeight = (weight: number) => {
  return weight.toFixed(2).replace(/\.?0+$/, '');
}

export { formatWeight };