import { IFromItemBase } from "../components"

const registry = {
  fields: {},
}

export const getRegistry = () => {
  return {
    fields: registry.fields,
  }
}

export const cleanRegistry = () => {
  registry.fields = {}
}
export interface IRdxFormComponent {
  value: any;
  onChange: any;
}
export function registryRdxFormComponent ( key: string, component: IFromItemBase<any>)  {
  registry.fields[key] = component
}

export function registryRdxFormComponents (components: { [key: string]: any} )  {
  Object.keys(components).forEach((key) => {
    registryRdxFormComponent(key, components[key] as any)
  })
}