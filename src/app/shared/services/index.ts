import { ProjectService } from './project.service';
import { SharedService } from './shared.service';

export * from './project.service';
export * from './shared.service';

export const services = [ProjectService, SharedService];
