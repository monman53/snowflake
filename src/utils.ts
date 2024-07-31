import { parameter, parameterProps } from './parameters'

export const humanReadable = (x: number) => {
  return x.toPrecision(4)
}

export const resetParameter = (category: any) => {
  for (const prop of category.props) {
    parameter.value[prop.name as keyof typeof parameter.value] = prop.default
  }
}

export const resetAllParameter = () => {
  for (const category of parameterProps.value) {
    for (const prop of category.props) {
      parameter.value[prop.name as keyof typeof parameter.value] = prop.default
    }
  }
}

export const randomParameter = () => {
  for (const category of parameterProps.value) {
    for (const prop of category.props) {
      parameter.value[prop.name as keyof typeof parameter.value] =
        prop.min + Math.random() * (prop.max - prop.min)
    }
  }
}
