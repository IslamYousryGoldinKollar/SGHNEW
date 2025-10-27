
import { EventEmitter } from 'events';

// It's crucial to use a single, shared instance of the EventEmitter.
class AppEventEmitter extends EventEmitter {}

export const errorEmitter = new AppEventEmitter();
