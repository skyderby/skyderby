import { ManufacturerRecord } from 'api/manufacturer'

export type OptionType = {
  value: number
  label: string
  make?: ManufacturerRecord
}
