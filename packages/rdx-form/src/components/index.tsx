import { registryRdxFormComponent } from '../core/registry'
import ObjectField from './ObjectField'
import ArrayCardField from './ArrayCardField'
export * from './FormLayout'
export * from './FromItem'
export { default as RdxFormContext} from './RdxFormContext'
registryRdxFormComponent('object', ObjectField as any)
registryRdxFormComponent('array', ArrayCardField as any)