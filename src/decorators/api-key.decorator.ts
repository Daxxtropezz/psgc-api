import { SetMetadata } from '@nestjs/common';

export const API_KEY = 'api-key';
export const ApiKey = () => SetMetadata(API_KEY, true);
