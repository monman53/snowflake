import { parameter, parameterProps } from './main'

export const humanReadable = (x: number) => {
  return x.toPrecision(4)
}

export const resetParameter = () => {
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
