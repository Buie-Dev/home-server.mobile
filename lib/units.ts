const LITRE_TO_GALLON = 0.264172;

const abbreviate = (value: number): string => {
  if (value >= 1000) {return `${(value / 1000).toFixed(2)}k`;}
  return value.toFixed(2);
};

export const formatVolume = (litres: number, useGallons: boolean): string => {
  const value = useGallons ? litres * LITRE_TO_GALLON : litres;
  const unit = useGallons ? 'gal' : 'L';
  return `${abbreviate(value)} ${unit}`;
};

export const volumeUnit = (useGallons: boolean) => (useGallons ? 'gal' : 'L');
