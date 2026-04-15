import crypto from 'crypto';

const hash = (value = '') => crypto.createHash('sha256').update(String(value)).digest('hex');

export default hash;
