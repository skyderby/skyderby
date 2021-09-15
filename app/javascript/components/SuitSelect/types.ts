import { ManufacturerRecord } from 'api/hooks/manufacturer'

export interface OptionData {
  name: string
  make: ManufacturerRecord
}

export interface OptionType {
  value: number
  label: string
  data: OptionData
}
