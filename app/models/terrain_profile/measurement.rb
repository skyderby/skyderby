class TerrainProfile::Measurement < ApplicationRecord
  belongs_to :terrain_profile, touch: true
end
