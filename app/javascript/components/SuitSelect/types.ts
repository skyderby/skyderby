import { ManufacturerRecord } from 'api/hooks/manufacturer'

export type OptionData = {
  name: string
  make: ManufacturerRecord
}

export type OptionType = {
  value: number
  label: string
  data: OptionData
}
