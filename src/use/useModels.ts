import { prependBaseUrl } from '@/utils/function'

export const modelImgPath = (id: string) => {
  return prependBaseUrl(`images/models/${id}_256x256.webp`)
}

const useModels = () => {

  return {
    modelImgPath
  }
}

export default useModels