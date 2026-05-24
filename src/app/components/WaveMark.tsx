import waveMarkImage from '../../imports/mark.png';

interface WaveMarkProps {
  size?: number;
  color?: string;
}

export default function WaveMark({ size = 40, color = '#DD3935' }: WaveMarkProps) {
  const getColorFilter = (hexColor: string): string => {
    // For white, no filter needed
    if (hexColor === '#FFFFFF') {
      return 'none';
    }

    // For black #0C0C0A
    if (hexColor === '#0C0C0A' || hexColor === '#000000') {
      return 'brightness(0)';
    }

    // For red #DD3935
    if (hexColor === '#DD3935') {
      return 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2481%) hue-rotate(345deg) brightness(92%) contrast(91%)';
    }

    // For gold #EBBD06
    if (hexColor === '#EBBD06') {
      return 'brightness(0) saturate(100%) invert(77%) sepia(73%) saturate(1724%) hue-rotate(1deg) brightness(97%) contrast(97%)';
    }

    // For green #027A4F
    if (hexColor === '#027A4F') {
      return 'brightness(0) saturate(100%) invert(33%) sepia(91%) saturate(1186%) hue-rotate(133deg) brightness(93%) contrast(101%)';
    }

    // Default: try to make it close to the color
    return 'brightness(0)';
  };

  return (
    <img
      src={waveMarkImage}
      alt="Wave Mark"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        filter: getColorFilter(color),
        display: 'block',
      }}
    />
  );
}
