import { ManufacturerRecord } from 'api/manufacturer'

export interface OptionData {
  name: string
  make: ManufacturerRecord
}

export interface OptionType {
  value: number
  label: string
  data: OptionData
}
