import { join } from 'path';

export const pathFromSrc = (path: string) => {
  return join(process.cwd(), 'src', path);
};

export const pathFromSrcAlt = (path: string) => {
  return join(__dirname, '../../', path);
};
